import { Blocks, Message } from 'slack-block-builder'

export const wrongFormatBlock = () =>
  Message()
    .blocks(
      Blocks.Header({
        text: '❌ Formato inválido.',
      }),
      Blocks.Divider(),
      Blocks.Section({
        text: 'La tarea que enviaste está en un formato equivocado, si estás en la clase 4 o menos tenés que enviar la tarea como bloque de código y a partir de la clase 5 tenés que enviar el link de github.',
      })
    )
    .buildToObject()
