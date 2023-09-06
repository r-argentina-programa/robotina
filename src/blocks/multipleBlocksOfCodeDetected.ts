import { Blocks, Message } from 'slack-block-builder';

export const multipleBlocksOfCodeDetected = () =>
  Message()
    .blocks(
      Blocks.Header({
        text: '❌ Formato inválido.',
      }),
      Blocks.Divider(),
      Blocks.Section({
        text: 'Asegurate de mandar la tarea en un solo bloque de código, no en varios. Para ayudarte un poco, podés divirlo algo así: ```Tarea 1\n console.log("tarea 1")\n\nTarea 2\n console.log("tarea 2")```',
      })
    )
    .buildToObject();
