import { StyleSheet } from 'react-native';

export const knobStyles = StyleSheet.create({
  knob: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    left: '50%',
    top: '50%',
  },
  fillLayer: {
    position: 'absolute',
  },
  ringBase: {
    position: 'absolute',
  },
  ringSvg: {
    position: 'absolute',
  },
  pointerLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  markDot: {
    position: 'absolute',
  },
  markLabelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  markLabelText: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  valueLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  valueLabelSecondaryContainer: {
    opacity: 0.9,
  },
  valueLabelText: {
    textAlign: 'center',
  },
  valueLabelSecondaryText: {
    textAlign: 'center',
  },
  valueLabelAffix: {
    marginHorizontal: 2,
  },
  valueLabelStackVertical: {
    alignItems: 'center',
  },
  valueLabelStackHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickDot: {
    position: 'absolute',
  },
  tickLineSvg: {
    position: 'absolute',
  },
  tickIcon: {
    position: 'absolute',
  },
  tickCustom: {
    position: 'absolute',
  },
  tickLabelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tickLabelText: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  statusIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
