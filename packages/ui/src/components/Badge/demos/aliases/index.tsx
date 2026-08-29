import { Badge, Block, Row } from '@platform-blocks/ui'

const badges = [
  { label: 'Primary Filled', variant: 'filled', color: 'primary' },
  { label: 'Secondary Outline', variant: 'outline', color: 'secondary' },
  { label: 'Success Light', variant: 'light', color: 'success' },
  { label: 'Warning Subtle', variant: 'subtle', color: 'warning' },
] as const

export function Demo() {
  return (
    <Block>
      <Row gap="sm" wrap="wrap">
        {badges.map((badge) => (
          <Badge
            key={`full-${badge.label}`}
            variant={badge.variant}
            color={badge.color}
          >
            {badge.label}
          </Badge>
        ))}
      </Row>

      <Row gap="sm" wrap="wrap">
        {badges.map((badge) => (
          <Badge key={`alias-${badge.label}`} v={badge.variant} c={badge.color}>
            {badge.label}
          </Badge>
        ))}
      </Row>
    </Block>
  )
}