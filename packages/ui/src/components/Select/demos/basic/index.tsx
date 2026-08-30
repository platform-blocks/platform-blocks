import { Select } from '@platform-blocks/react-ui-library'
import { sports } from '../data'

export function Demo() {
  return (
    <Select
      label="Favorite sport"
      description="Choose your favorite sport"
      placeholder="Choose a sport"
      options={sports}
    />
  )
}
