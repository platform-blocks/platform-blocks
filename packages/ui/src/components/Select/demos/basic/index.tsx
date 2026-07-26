import { Select } from '@platform-blocks/ui'
import { sports } from '../data'

export default function Demo() {
  return (
    <Select
      label="Favorite sport"
      description="Choose your favorite sport"
      placeholder="Choose a sport"
      options={sports}
    />
  )
}
