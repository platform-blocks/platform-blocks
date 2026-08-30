import { View, useWindowDimensions } from 'react-native';
import { Text, Slider,  Masonry, Switch } from '@platform-blocks/react-ui-library';

export const SliderPlayground = () => {
  const { width } = useWindowDimensions();
  const isSmall = width < 768;

  const masonryItems = [
    {
      id: '1',
      content: (
        <Switch checked={true} onChange={() => {}} />
      ),
    }, {
      id: '4',
      content: (
        <Switch checked={true} onChange={() => {}} />
      ),
    }, {
      id: '5',
      content: (
        <Switch checked={true} onChange={() => {}} />
      ),
    },
    ]

  return (
    <View style={isSmall && { width: '100%' }}>
      
       <Masonry
      data={masonryItems}
      numColumns={8}
    />
        <Slider
          label="Disabled Slider"
          defaultValue={50}
          min={0}
          max={100}
          step={1}
          disabled
        />
        <Slider
          label="Default Slider"
          defaultValue={30}
          min={0}
          max={100}
          step={1}
        />
    </View>
  );
};