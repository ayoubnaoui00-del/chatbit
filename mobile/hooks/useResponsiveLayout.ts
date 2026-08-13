import { useWindowDimensions } from 'react-native';

export const useResponsiveLayout = () => {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 768;
  const isTablet = width >= 600 && width < 768;
  const isMobile = width < 600;

  return {
    windowWidth: width,
    windowHeight: height,
    isDesktop,
    isTablet,
    isMobile,
  };
};
