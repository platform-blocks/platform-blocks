import { Card, Spoiler, Text } from '@platform-blocks/ui';
import { Image, Platform, View } from 'react-native';

const paragraphs = [
  'The coastal morning edition arrived with stories about record tides and neighborhoods working together to reinforce their seawalls. Photographers captured gulls darting between the waves as volunteers stacked sandbags along the promenade.',
  'Hidden inside the fold was a feature about an amateur archivist who discovered a crate of glass negatives documenting life on the waterfront a century ago. Each plate is being digitized so classrooms can study the evolution of the shoreline.',
  'City gardeners are also experimenting with hardy dune grasses to keep wind-swept sand in place during the colder months. The pilot plots stretch for blocks and bring a warm beige tone to an otherwise grey season.',
];

export function Demo() {
  const isWeb = Platform.OS === 'web';

  return (
    <Card p="md">
      <Spoiler maxHeight={isWeb ? 220 : 260}>
        <View style={{ flexDirection: isWeb ? 'row' : 'column' }}>
          <Image
            source={require('../../../../assets/images/scene-ocean.png')}
            style={{ width: 180, height: 180, borderRadius: 12, marginRight: isWeb ? 16 : 0, marginBottom: isWeb ? 0 : 12 }}
          />
          <View style={{ flex: 1, marginTop: isWeb ? 0 : 8 }}>
            {paragraphs.map((paragraph) => (
              <Text key={paragraph} size="lg" style={{ marginBottom: 12 }}>
                {paragraph}
              </Text>
            ))}
          </View>
        </View>
      </Spoiler>
    </Card>
  );
}
