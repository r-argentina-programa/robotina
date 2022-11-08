import { Message, Blocks } from 'slack-block-builder'

export const greetingsBlock = (channel: string) =>
  Message({ channel, text: 'greeting-block-alter' })
    .blocks(
      Blocks.Header({
        text: 'Bienvenido a r-argentina-programa!',
      }),
      Blocks.Divider(),
      Blocks.Section({
        text: 'Este es un curso para aprender JavaScript desde 0, gratis y en español.',
      }),
      Blocks.Section({
        text: "Se recomienda hacer las tareas de cada clase y postearlas en su canal correspondiente, así alguno de los mentores o alumnos más avanzados pueden correjirlas y ayudarlos'",
      }),
      Blocks.Header({
        text: 'Todavía tenés preguntas?',
      }),
      Blocks.Section({
        text: 'Mirá las preguntas frecuentes <https://argentinaprograma.com/faq|*aca*> !',
      })
    )
    .buildToObject()
