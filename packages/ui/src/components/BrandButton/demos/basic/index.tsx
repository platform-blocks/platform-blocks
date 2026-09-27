import { BrandButton, useToast } from '@platform-blocks/ui';
export function Demo() {
  const toast = useToast()
  return <BrandButton
   title="Click Me" 
  brand="facebook"
    onPress={() => toast.warn({ 
      title: 'What the Zuck!',
      message: 'I love Sweet Baby Ray\'s',
      position: 'top-center'
    })}
  />
}
