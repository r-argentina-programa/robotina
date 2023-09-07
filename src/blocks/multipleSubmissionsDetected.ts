import { Blocks, Message } from 'slack-block-builder';

export const multipleSubmissionFormatsDetected = () =>
  Message()
    .blocks(
      Blocks.Header({
        text: '❌ Formato inválido.',
      }),
      Blocks.Divider(),
      Blocks.Section({
        text: 'Estás queriendo subir más de un formato a la vez. Intentá enviar tu tarea en uno solo. \n\n\nRecordá que si estás en la clase 4 o menos, tenés que enviar la tarea como bloque de código, y a partir de la clase 5 tenés que enviar el link de GitHub.',
      })
    )
    .buildToObject();
