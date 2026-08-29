import { BrandButton, useToast } from '@platform-blocks/ui';
export function Demo() {
  const toast = useToast()
  return <BrandButton
   title="Click Me" 
  brand="facebook"
    onPress={() => toast.warn({ 
      title: 'What the Zuck!',
      message: 'This is a Facebook brand button',
      position: 'top-center'
    })}
  />
}
