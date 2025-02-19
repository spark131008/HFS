declare module 'react-wordcloud' {
  interface Word {
    text: string;
    value: number;
  }

  interface Options {
    colors?: string[];
    enableTooltip?: boolean;
    deterministic?: boolean;
    fontFamily?: string;
    fontSizes?: [number, number];
    fontStyle?: string;
    fontWeight?: string;
    padding?: number;
    rotations?: number;
    rotationAngles?: [number, number];
    scale?: string;
    spiral?: string;
    transitionDuration?: number;
  }

  interface ReactWordcloudProps {
    words: Word[];
    options?: Options;
  }

  const ReactWordcloud: React.FC<ReactWordcloudProps>;
  export default ReactWordcloud;
} 