declare module 'react-joyride' {
  import { ComponentType, ReactNode } from 'react';

  export interface Step {
    target: string;
    content: ReactNode;
    placement?: string;
    disableBeacon?: boolean;
    floaterProps?: Record<string, any>;
    spotlightPadding?: number;
    title?: string | ReactNode;
    styles?: Record<string, any>;
    [key: string]: any;
  }

  export interface Props {
    steps: Step[];
    run: boolean;
    continuous?: boolean;
    scrollToFirstStep?: boolean;
    showProgress?: boolean;
    showSkipButton?: boolean;
    callback?: (data: any) => void;
    [key: string]: any;
  }

  const Joyride: ComponentType<Props>;
  export default Joyride;
}
