'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  ChevronDown, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Smile,
  Frown,
  Meh,
  Target,
  Star,
  ArrowLeft,
  Image as ImageIcon,
  MessageSquare,
  Clock
} from 'lucide-react';
import MainNavigationBar from '@/components/MainNavigationBar';
import { theme, cn } from '@/theme';

// Types
interface QuestionData {
  id: string;
  text: string;
  positive: number;
  negative: number;
  category: string;
}

interface DailyDataPoint {
  label: string;
  value: number;
  date?: string; // Full date for date display
  dayOfWeek?: string; // Day of week for day display
}

interface RawResponse {
  submitted_at: string;
  question_answers: Record<string, string>;
}

interface QuestionMetadata {
  question_text: string;
  options: string[];
  category: string;
}

interface DashboardClientProps {
  surveyTitle: string;
  dailyData: DailyDataPoint[];
  dateRange: string;
  rawResponseData: RawResponse[];
  questionMetadata: QuestionMetadata[];
  questionCategoryMap: Record<string, string>;
}

// 1. The "Delight" KPI Card
const KpiCard = ({ title, value, trend, trendValue, icon: Icon, colorClass, delay }: {
  title: string;
  value: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  icon: React.ElementType;
  colorClass: string;
  delay: number;
}) => (
  <div 
    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
    style={{ animation: `fadeInUp 0.5s ease-out ${delay}s backwards` }}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend === 'up' ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
          {trendValue}
        </div>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <div className="text-3xl font-bold text-slate-800">{value}</div>
  </div>
);

// 2. Custom Smooth Area Chart (SVG)
const SmoothAreaChart = ({ data, showDates }: { data: DailyDataPoint[]; showDates: boolean }) => {
  const height = 200;
  const width = 800; // ViewBox width
  const padding = 20;
  
  // Normalize data to fit SVG
  const maxY = Math.max(...data.map(d => d.value), 1) * 1.2;
  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * (width - 2 * padding) + padding;
    const y = height - padding - (d.value / maxY) * (height - 2 * padding);
    return { x, y, ...d };
  });

  // Generate Smooth Path (Catmull-Rom spline or simple Bezier approx)
  const pathData = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = a[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
  }, "");

  const areaPath = `${pathData} L ${width - padding},${height} L ${padding},${height} Z`;

  return (
    <div className="w-full h-64 overflow-hidden relative group">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Area Fill */}
        <path d={areaPath} fill="url(#gradient)" className="transition-all duration-1000 ease-out" />
        
        {/* Stroke Line */}
        <path 
          d={pathData} 
          fill="none" 
          stroke="#6366f1" 
          strokeWidth="4" 
          strokeLinecap="round" 
          className="drop-shadow-md"
        />
        
        {/* Data Points */}
        {points.map((p, i) => (
          <g key={i} className="group/point">
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="6" 
              fill="#fff" 
              stroke="#6366f1" 
              strokeWidth="3"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            />
            {/* Tooltip on Hover */}
            <foreignObject x={p.x - 30} y={p.y - 50} width="60" height="40" className="opacity-0 group-hover/point:opacity-100 transition-all duration-200 pointer-events-none">
               <div className="bg-slate-800 text-white text-xs rounded px-2 py-1 text-center font-bold shadow-lg transform translate-y-1 group-hover/point:translate-y-0 transition-transform">
                 {p.value}
               </div>
            </foreignObject>
          </g>
        ))}
      </svg>
      
      {/* Axis Labels (Simple HTML Overlay) */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-slate-400 font-medium uppercase tracking-wider">
        {points.map((p, i) => (
          <span key={i}>
            {showDates && p.date ? (
              <span className="normal-case">{new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            ) : (
              p.label
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

// 3. Feedback Card Component
const FeedbackCard = ({ question, delay, onClick }: { question: QuestionData; delay: number; onClick: () => void }) => {
  const total = question.positive + question.negative;
  const percentage = total > 0 ? Math.round((question.positive / total) * 100) : 0;
  const isHighPerforming = percentage >= 90;
  const isWarning = percentage < 75;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col justify-between h-full group cursor-pointer"
      style={{ animation: `fadeInUp 0.5s ease-out ${delay}s backwards` }}
    >
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
            {question.category}
          </span>
          {isHighPerforming && <Star size={16} className="text-amber-400 fill-amber-400 animate-pulse" />}
        </div>
        <h4 className="text-slate-800 font-semibold leading-snug text-lg mb-1 group-hover:text-indigo-600 transition-colors">
          {question.text}
        </h4>
      </div>

      <div className="mt-auto">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold text-slate-900">{percentage}%</span>
            <span className="text-sm text-slate-500 font-medium">satisfied</span>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {total} responses
          </div>
        </div>

        {/* Aesthetic Progress Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              isHighPerforming ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 
              isWarning ? 'bg-gradient-to-r from-orange-400 to-rose-500' :
              'bg-gradient-to-r from-indigo-400 to-purple-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Micro details */}
        <div className="flex justify-between mt-2 text-xs font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="flex items-center text-emerald-600"><Smile size={12} className="mr-1"/> {question.positive}</span>
          <span className="flex items-center text-rose-500"><Frown size={12} className="mr-1"/> {question.negative}</span>
        </div>
      </div>
    </div>
  );
};

// 4. Trend Chart for Positive/Negative Over Time
const TrendChart = ({ data }: { data: { date: string; positive: number; negative: number }[] }) => {
  const height = 250;
  const width = 800;
  const padding = 40;
  
  const maxY = Math.max(...data.map(d => d.positive + d.negative), 1) * 1.2;
  
  const positivePoints = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * (width - 2 * padding) + padding;
    const y = height - padding - (d.positive / maxY) * (height - 2 * padding);
    return { x, y, value: d.positive, date: d.date };
  });

  const negativePoints = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * (width - 2 * padding) + padding;
    const y = height - padding - ((d.positive + d.negative) / maxY) * (height - 2 * padding);
    return { x, y, value: d.negative, date: d.date, baseY: height - padding - (d.positive / maxY) * (height - 2 * padding) };
  });

  // Generate paths
  const positivePath = positivePoints.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = positivePoints[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
  }, "");

  // Create total points (positive + negative) for the top of negative area
  const totalPoints = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * (width - 2 * padding) + padding;
    const y = height - padding - ((d.positive + d.negative) / maxY) * (height - 2 * padding);
    return { x, y };
  });

  // Generate total path (top line of negative area) - forward
  const totalPathForward = totalPoints.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = totalPoints[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
  }, "");

  // Generate total path reversed (for closing the area)
  const totalPathReversed = totalPoints.slice().reverse().reduce((acc, point, i, arr) => {
    if (i === 0) return `L ${point.x},${point.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
  }, "");

  // Generate negative base path (bottom line of negative area - same as positive top line)
  const negativeBasePath = negativePoints.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x},${point.baseY}`;
    const prev = negativePoints[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.baseY;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.baseY;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.baseY}`;
  }, "");

  const positiveArea = `${positivePath} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;
  // Negative area: base path (positive line) + line to last total point + total path reversed + close
  const lastTotalPoint = totalPoints[totalPoints.length - 1];
  const firstBasePoint = negativePoints[0];
  const negativeArea = `${negativeBasePath} L ${lastTotalPoint.x},${lastTotalPoint.y} ${totalPathReversed} L ${firstBasePoint.x},${firstBasePoint.baseY} Z`;

  return (
    <div className="w-full h-80 overflow-hidden relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="positiveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="negativeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Negative Area (stacked on top of positive) */}
        <path d={negativeArea} fill="url(#negativeGradient)" />
        <path d={totalPathForward} fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        
        {/* Positive Area (top) */}
        <path d={positiveArea} fill="url(#positiveGradient)" />
        <path d={positivePath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        
        {/* Data Points */}
        {positivePoints.map((p, i) => (
          <g key={`pos-${i}`} className="group/point">
            <circle cx={p.x} cy={p.y} r="5" fill="#10b981" stroke="#fff" strokeWidth="2" className="opacity-0 group-hover/point:opacity-100 transition-opacity" />
            <foreignObject x={p.x - 30} y={p.y - 50} width="60" height="40" className="opacity-0 group-hover/point:opacity-100 pointer-events-none">
              <div className="bg-emerald-600 text-white text-xs rounded px-2 py-1 text-center font-bold shadow-lg">
                +{p.value}
              </div>
            </foreignObject>
          </g>
        ))}
        
        {negativePoints.map((p, i) => (
          <g key={`neg-${i}`} className="group/point">
            <circle cx={p.x} cy={p.baseY} r="5" fill="#ef4444" stroke="#fff" strokeWidth="2" className="opacity-0 group-hover/point:opacity-100 transition-opacity" />
            <foreignObject x={p.x - 30} y={p.baseY - 50} width="60" height="40" className="opacity-0 group-hover/point:opacity-100 pointer-events-none">
              <div className="bg-rose-600 text-white text-xs rounded px-2 py-1 text-center font-bold shadow-lg">
                -{p.value}
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 flex gap-4">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-xs font-semibold text-slate-700">Positive</span>
        </div>
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
          <span className="text-xs font-semibold text-slate-700">Negative</span>
        </div>
      </div>
      
      {/* X-Axis Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 pb-2 text-xs text-slate-400 font-medium">
        {data.map((d, i) => (
          <span key={i}>
            {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        ))}
      </div>
    </div>
  );
};

// 5. Comment Card Component
interface CommentData {
  id: string;
  text: string;
  photoUrl: string;
  timestamp: string;
  sentiment: 'positive' | 'negative';
}

const DUMMY_COMMENTS: CommentData[] = [
  {
    id: '1',
    text: 'Excellent service! The staff was very attentive and the atmosphere was perfect.',
    photoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sentiment: 'positive'
  },
  {
    id: '2',
    text: 'Great experience overall. Would definitely come back again!',
    photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    sentiment: 'positive'
  },
  {
    id: '3',
    text: 'The service was okay, but could be improved. Some areas need attention.',
    photoUrl: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=200&h=200&fit=crop',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: 'negative'
  },
  {
    id: '4',
    text: 'Amazing! Everything exceeded my expectations. Highly recommend!',
    photoUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: 'positive'
  },
  {
    id: '5',
    text: 'Not satisfied with the experience. Several issues that need to be addressed.',
    photoUrl: 'https://images.unsplash.com/photo-1552569973-610b96917a2f?w=200&h=200&fit=crop',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: 'negative'
  }
];

const CommentCard = ({ comment }: { comment: CommentData }) => {
  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - commentTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return commentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={comment.photoUrl} 
              alt="Feedback photo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Photo';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <ImageIcon size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
              comment.sentiment === 'positive' 
                ? 'bg-emerald-50 text-emerald-600' 
                : 'bg-rose-50 text-rose-600'
            }`}>
              {comment.sentiment === 'positive' ? <Smile size={12} /> : <Frown size={12} />}
              {comment.sentiment === 'positive' ? 'Positive' : 'Negative'}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock size={12} />
              {timeAgo(comment.timestamp)}
            </div>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed">{comment.text}</p>
          <div className="mt-2 text-xs text-slate-400">
            {new Date(comment.timestamp).toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. Drill-Down View Component
const DrillDownView = ({ 
  question, 
  onBack, 
  rawResponseData, 
  dateRangeType, 
  startDate, 
  endDate 
}: { 
  question: QuestionData; 
  onBack: () => void;
  rawResponseData: RawResponse[];
  dateRangeType: '7days' | 'custom';
  startDate: string;
  endDate: string;
}) => {
  const dummyComments = DUMMY_COMMENTS;

  // Calculate trend data over time
  const trendData = useMemo(() => {
    const filteredResponses = dateRangeType === '7days' 
      ? rawResponseData.filter(r => {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return new Date(r.submitted_at) >= sevenDaysAgo;
        })
      : startDate && endDate
      ? rawResponseData.filter(r => {
          const responseDate = new Date(r.submitted_at).toISOString().split('T')[0];
          return responseDate >= startDate && responseDate <= endDate;
        })
      : rawResponseData;

    // Group by date
    const dateMap = new Map<string, { positive: number; negative: number }>();
    
    filteredResponses.forEach(response => {
      const responseDate = new Date(response.submitted_at).toISOString().split('T')[0];
      const answer = response.question_answers[question.text];
      
      if (!dateMap.has(responseDate)) {
        dateMap.set(responseDate, { positive: 0, negative: 0 });
      }
      
      const data = dateMap.get(responseDate)!;
      if (answer === 'right') {
        data.positive++;
      } else if (answer === 'left') {
        data.negative++;
      }
    });

    // Generate all dates in range
    const dates: string[] = [];
    if (dateRangeType === '7days') {
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const current = new Date(start);
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    }

    return dates.map(date => ({
      date,
      positive: dateMap.get(date)?.positive || 0,
      negative: dateMap.get(date)?.negative || 0
    }));
  }, [question.text, rawResponseData, dateRangeType, startDate, endDate]);

  const total = question.positive + question.negative;
  const percentage = total > 0 ? Math.round((question.positive / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-semibold mb-6 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Question Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                  {question.category}
                </span>
                {percentage >= 90 && <Star size={18} className="text-amber-400 fill-amber-400" />}
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-4">{question.text}</h1>
              <div className="flex items-center gap-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900">{percentage}%</span>
                  <span className="text-lg text-slate-500 font-medium">satisfied</span>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Smile size={20} className="text-emerald-500" />
                    <span className="text-xl font-bold text-emerald-600">{question.positive}</span>
                    <span className="text-sm text-slate-500">positive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Frown size={20} className="text-rose-500" />
                    <span className="text-xl font-bold text-rose-600">{question.negative}</span>
                    <span className="text-sm text-slate-500">negative</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Trends Over Time</h2>
            <p className="text-slate-400 text-sm">Positive and negative feedback distribution</p>
          </div>
          <TrendChart data={trendData} />
        </div>

        {/* Top Comments Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                <MessageSquare size={24} />
                Top 5 Comments
              </h2>
              <p className="text-slate-400 text-sm">Recent feedback with photos</p>
            </div>
            <div className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full font-semibold">
              Preview Mode
            </div>
          </div>
          <div className="space-y-4">
            {dummyComments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardClient({
  surveyTitle,
  dailyData: initialDailyData,
  dateRange: initialDateRange,
  rawResponseData,
  questionMetadata,
  questionCategoryMap
}: DashboardClientProps) {
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [dateRangeType, setDateRangeType] = useState<'7days' | 'custom'>('7days');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [chartShowDates, setChartShowDates] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionData | null>(null);


  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown-container')) {
        setShowFilterDropdown(false);
      }
      if (!target.closest('.date-picker-container')) {
        setShowDatePicker(false);
      }
    };

    if (showFilterDropdown || showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFilterDropdown, showDatePicker]);

  // Filter responses by date range
  const filteredResponses = useMemo(() => {
    if (dateRangeType === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      return rawResponseData.filter(r => {
        const responseDate = new Date(r.submitted_at);
        return responseDate >= sevenDaysAgo;
      });
    } else if (dateRangeType === 'custom' && startDate && endDate) {
      // Normalize dates to date-only strings (YYYY-MM-DD) for comparison
      // This avoids timezone issues
      const startDateStr = startDate; // Already in YYYY-MM-DD format from input
      const endDateStr = endDate; // Already in YYYY-MM-DD format from input
      
      return rawResponseData.filter(r => {
        // Convert response date to YYYY-MM-DD format for comparison
        const responseDate = new Date(r.submitted_at);
        const responseDateStr = responseDate.toISOString().split('T')[0];
        
        // Compare date strings directly
        return responseDateStr >= startDateStr && responseDateStr <= endDateStr;
      });
    }
    return rawResponseData;
  }, [dateRangeType, startDate, endDate, rawResponseData]);

  // Recalculate questions based on filtered responses
  const questions = useMemo(() => {
    const questionResponseMap = new Map<string, { 
      positive: number; 
      negative: number; 
      category: string;
      text: string;
    }>();

    // Initialize questions from metadata
    questionMetadata.forEach(meta => {
      questionResponseMap.set(meta.question_text, {
        positive: 0,
        negative: 0,
        category: meta.category,
        text: meta.question_text
      });
    });

    // Count responses
    filteredResponses.forEach(response => {
      Object.entries(response.question_answers).forEach(([question, answer]) => {
        if (!questionResponseMap.has(question)) {
          questionResponseMap.set(question, {
            positive: 0,
            negative: 0,
            category: questionCategoryMap[question] || "General",
            text: question
          });
        }
        
        const data = questionResponseMap.get(question)!;
        if (answer === 'right') {
          data.positive++;
        } else if (answer === 'left') {
          data.negative++;
        }
      });
    });

    return Array.from(questionResponseMap.entries())
      .map(([, value], index) => ({
        id: `q-${index}`,
        text: value.text,
        positive: value.positive,
        negative: value.negative,
        category: value.category
      }))
      .filter(q => q.positive + q.negative > 0)
      .sort((a, b) => (b.positive + b.negative) - (a.positive + a.negative));
  }, [filteredResponses, questionMetadata, questionCategoryMap]);

  // Recalculate daily data based on filtered responses
  const dailyData = useMemo(() => {
    if (dateRangeType === '7days') {
      const now = new Date();
      const dailyDataMap = new Map<string, number>();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyDataMap.set(dateStr, 0);
      }
      
      filteredResponses.forEach(r => {
        const dateStr = new Date(r.submitted_at).toISOString().split('T')[0];
        if (dailyDataMap.has(dateStr)) {
          dailyDataMap.set(dateStr, (dailyDataMap.get(dateStr) || 0) + 1);
        }
      });
      
      return Array.from(dailyDataMap.entries()).map(([dateStr]) => {
        const date = new Date(dateStr);
        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
        return {
          label: dayLabel,
          value: dailyDataMap.get(dateStr) || 0,
          date: dateStr,
          dayOfWeek: dayLabel
        };
      });
    } else if (dateRangeType === 'custom' && startDate && endDate) {
      const dailyDataMap = new Map<string, number>();
      
      // Generate all dates in range using date strings (YYYY-MM-DD)
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      const current = new Date(start);
      
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        dailyDataMap.set(dateStr, 0);
        current.setDate(current.getDate() + 1);
      }
      
      filteredResponses.forEach(r => {
        const dateStr = new Date(r.submitted_at).toISOString().split('T')[0];
        if (dailyDataMap.has(dateStr)) {
          dailyDataMap.set(dateStr, (dailyDataMap.get(dateStr) || 0) + 1);
        }
      });
      
      return Array.from(dailyDataMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dateStr]) => {
          const date = new Date(dateStr + 'T00:00:00');
          const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
          return {
            label: dayLabel,
            value: dailyDataMap.get(dateStr) || 0,
            date: dateStr,
            dayOfWeek: dayLabel
          };
        });
    }
    
    return initialDailyData;
  }, [dateRangeType, startDate, endDate, filteredResponses, initialDailyData]);

  // Recalculate KPIs based on filtered responses
  const filteredTotalResponses = filteredResponses.length;
  const filteredTotalRequests = Math.max(filteredTotalResponses + Math.round(filteredTotalResponses * 0.25), 10);
  const filteredConversionRate = filteredTotalResponses > 0 
    ? ((filteredTotalResponses / filteredTotalRequests) * 100).toFixed(1) 
    : "0.0";

  // Calculate percent change (compare last period to previous period)
  const percentChange = useMemo(() => {
    if (filteredTotalResponses === 0) return '0%';
    
    if (dateRangeType === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const previousWeekStart = new Date(sevenDaysAgo);
      previousWeekStart.setDate(previousWeekStart.getDate() - 7);
      
      const previousWeekResponses = rawResponseData.filter(r => {
        const responseDate = new Date(r.submitted_at);
        return responseDate >= previousWeekStart && responseDate < sevenDaysAgo;
      }).length;
      
      if (previousWeekResponses === 0) return '+100%';
      const change = ((filteredTotalResponses - previousWeekResponses) / previousWeekResponses) * 100;
      return (change >= 0 ? '+' : '') + Math.round(change) + '%';
    } else {
      // For custom range, compare to same length period before
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const periodLength = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        const previousStart = new Date(start);
        previousStart.setDate(previousStart.getDate() - periodLength);
        const previousEnd = new Date(start);
        
        const previousPeriodResponses = rawResponseData.filter(r => {
          const responseDate = new Date(r.submitted_at);
          return responseDate >= previousStart && responseDate < previousEnd;
        }).length;
        
        if (previousPeriodResponses === 0) return '+100%';
        const change = ((filteredTotalResponses - previousPeriodResponses) / previousPeriodResponses) * 100;
        return (change >= 0 ? '+' : '') + Math.round(change) + '%';
      }
    }
    return '0%';
  }, [dateRangeType, startDate, endDate, filteredTotalResponses, rawResponseData]);

  // Format date range display
  const dateRange = useMemo(() => {
    if (dateRangeType === '7days') {
      return 'Last 7 Days';
    } else if (dateRangeType === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const startFormatted = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endFormatted = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${startFormatted} - ${endFormatted}`;
    }
    return initialDateRange;
  }, [dateRangeType, startDate, endDate, initialDateRange]);

  const filteredData = useMemo(() => {
    let data = [...questions];
    if (filter !== 'All') {
      data = data.filter(q => q.category === filter);
    }
    if (sortBy === 'highest') {
      data.sort((a, b) => {
        const aPct = a.positive + a.negative > 0 ? (a.positive / (a.positive + a.negative)) : 0;
        const bPct = b.positive + b.negative > 0 ? (b.positive / (b.positive + b.negative)) : 0;
        return bPct - aPct;
      });
    } else if (sortBy === 'lowest') {
      data.sort((a, b) => {
        const aPct = a.positive + a.negative > 0 ? (a.positive / (a.positive + a.negative)) : 0;
        const bPct = b.positive + b.negative > 0 ? (b.positive / (b.positive + b.negative)) : 0;
        return aPct - bPct;
      });
    }
    return data;
  }, [filter, sortBy, questions]);

  const categories = ['All', ...new Set(questions.map(q => q.category))];

  // Handle date range selection
  const handleDateRangeSelect = (type: '7days' | 'custom') => {
    if (type === '7days') {
      setDateRangeType('7days');
      setShowDatePicker(false);
      setStartDate('');
      setEndDate('');
    } else {
      // For custom, just show the picker
      setShowDatePicker(true);
    }
  };

  const handleCustomDateApply = () => {
    if (startDate && endDate && new Date(startDate) <= new Date(endDate)) {
      setDateRangeType('custom');
      setShowDatePicker(false);
    }
  };

  // If a question is selected, show drill-down view
  if (selectedQuestion) {
    return (
      <>
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <MainNavigationBar />
        <DrillDownView
          question={selectedQuestion}
          onBack={() => setSelectedQuestion(null)}
          rawResponseData={rawResponseData}
          dateRangeType={dateRangeType}
          startDate={startDate}
          endDate={endDate}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 selection:bg-indigo-100">
      {/* Global Styles for Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <MainNavigationBar />

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10">
          <div className="mb-4 md:mb-0">
            <h1 className={cn(
              theme.typography.fontFamily.display,
              theme.typography.fontWeight.bold,
              theme.typography.fontSize["2xl"],
              "md:text-4xl tracking-tight mb-1",
              theme.colors.text.gradient
            )}>
              {surveyTitle}
            </h1>
            <p className="text-slate-500 text-lg">Insights for <span className="font-semibold text-indigo-600">{dateRange}</span></p>
          </div>
          
          <div className="flex items-center space-x-3 bg-white p-1 rounded-xl shadow-sm border border-slate-200 relative date-picker-container">
            <button 
              onClick={() => handleDateRangeSelect('7days')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                dateRangeType === '7days' 
                  ? 'text-white bg-indigo-600 shadow-md shadow-indigo-200' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Last 7 Days
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <button 
              onClick={() => handleDateRangeSelect('custom')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center ${
                dateRangeType === 'custom' 
                  ? 'text-white bg-indigo-600 shadow-md shadow-indigo-200' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Calendar size={16} className="mr-2" />
              Custom Range
            </button>
            
            {/* Date Picker Modal */}
            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-20 p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCustomDateApply}
                    disabled={!startDate || !endDate || new Date(startDate) > new Date(endDate)}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      setShowDatePicker(false);
                      setStartDate('');
                      setEndDate('');
                      setDateRangeType('7days');
                    }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <KpiCard 
            title="Potential Requests" 
            value={filteredTotalRequests.toLocaleString()} 
            icon={Users} 
            colorClass="bg-blue-500" 
            delay={0.1} 
          />
          <KpiCard 
            title="Total Responses" 
            value={filteredTotalResponses.toLocaleString()} 
            trend="up" 
            trendValue={percentChange} 
            icon={TrendingUp} 
            colorClass="bg-indigo-500" 
            delay={0.2} 
          />
          <KpiCard 
            title="Conversion Rate" 
            value={`${filteredConversionRate}%`} 
            icon={Target} 
            colorClass="bg-emerald-500" 
            delay={0.3} 
          />
        </div>

        {/* Main Chart Section */}
        {dailyData.length > 0 && (
          <div 
            className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-10 relative overflow-hidden"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.4s backwards' }}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Response Trends</h2>
                <p className="text-slate-400 text-sm">Daily feedback volume over time</p>
              </div>
              <div className="flex items-center gap-3">
                {/* X-Axis Toggle */}
                <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setChartShowDates(false)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                      !chartShowDates 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => setChartShowDates(true)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                      chartShowDates 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Date
                  </button>
                </div>
                <div className="flex items-center text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm font-bold">
                  <TrendingUp size={16} className="mr-2" />
                  {percentChange} vs last week
                </div>
              </div>
            </div>
            <SmoothAreaChart data={dailyData} showDates={chartShowDates} />
          </div>
        )}

        {/* Feedback Grid Header */}
        {questions.length > 0 && (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                Detailed Breakdown 
                <span className="ml-3 px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-md font-semibold uppercase tracking-wide">
                  {filteredData.length} Items
                </span>
              </h2>
              
              <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                {/* Category Filter */}
                <div className="relative filter-dropdown-container">
                  <button 
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg text-sm font-medium text-slate-600 shadow-sm border border-slate-200 hover:border-indigo-300 transition-all"
                  >
                    <Filter size={16} />
                    <span>{filter}</span>
                    <ChevronDown size={16} className={`transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {/* Dropdown */}
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-10">
                      {categories.map(cat => (
                        <div 
                          key={cat}
                          onClick={() => {
                            setFilter(cat);
                            setShowFilterDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-indigo-50 text-sm text-slate-600 cursor-pointer first:rounded-t-xl last:rounded-b-xl"
                        >
                          {cat}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sort Toggle */}
                <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                  <button 
                    onClick={() => setSortBy('default')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${sortBy === 'default' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Default
                  </button>
                  <button 
                    onClick={() => setSortBy('highest')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${sortBy === 'highest' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Best
                  </button>
                  <button 
                    onClick={() => setSortBy('lowest')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${sortBy === 'lowest' ? 'bg-rose-50 text-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Worst
                  </button>
                </div>
              </div>
            </div>

            {/* Feedback Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredData.map((q, index) => (
                <FeedbackCard 
                  key={q.id} 
                  question={q} 
                  delay={0.5 + (index * 0.1)}
                  onClick={() => setSelectedQuestion(q)}
                />
              ))}
            </div>

            {/* Empty State (if filter yields nothing) */}
            {filteredData.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <div className="bg-slate-50 p-4 rounded-full inline-block mb-4">
                  <Meh size={48} className="text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-bold text-lg">No feedback found</h3>
                <p className="text-slate-500">Try adjusting your filters to see more data.</p>
              </div>
            )}
          </>
        )}

        {/* No responses state */}
        {questions.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 p-4 rounded-full inline-block mb-4">
              <Meh size={48} className="text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-bold text-lg">No responses yet</h3>
            <p className="text-slate-500">Share your survey with customers to start collecting feedback.</p>
          </div>
        )}
      </div>
    </div>
  );
}

