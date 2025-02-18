'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import cloud from 'd3-cloud'

interface Word {
  text: string
  value: number
}

interface CloudWord {
  text: string
  size: number
  x?: number
  y?: number
  rotate?: number
  font?: string
}

interface WordCloudProps {
  words: Word[]
  width?: number
  height?: number
}

export function WordCloud({ words, width = 600, height = 400 }: WordCloudProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!words.length || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const maxSize = Math.max(...words.map(w => w.value))
    const fontSize = (value: number) => Math.sqrt(value / maxSize) * 40 + 10

    const layout = cloud()
      .size([width, height])
      .words(words.map(w => ({
        text: w.text,
        size: fontSize(w.value)
      })))
      .padding(5)
      .rotate(() => 0)
      .font("Inter")
      .fontSize(d => d.size)
      .on("end", draw)

    layout.start()

    function draw(words: CloudWord[]) {
      const group = svg
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`)

      group
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-family", "Inter")
        .style("font-size", d => `${d.size}px`)
        .style("fill", (_, i) => d3.interpolateRainbow(i / words.length))
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .text(d => d.text)
    }
  }, [words, width, height])

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height}
      style={{ width: '100%', height: '100%' }}
    />
  )
}