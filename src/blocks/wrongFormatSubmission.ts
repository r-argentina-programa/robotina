import { Blocks, Message } from 'slack-block-builder';

export const wrongFormatSubmission = () =>
  Message()
    .blocks(
      Blocks.Header({
        text: '❌ Formato inválido.',
      }),
      Blocks.Divider(),
      Blocks.Section({
        text: 'El formato que estás usando para entregar tu tarea no es válido o está vacío. \n\n\nLos formatos que tenés que usar son, si estás queriendo entregar una tarea de la clase 4 para abajo, un bloque de código: ``` console.log("tarea") ``` \nO, si estás queriendo entregar una tarea a partir de la clase 5 para arriba, entonces debería ser simplemente un link de GitHub: (https://github.com/...). \n\n\nY también acordate de mandar tu tarea en un solo formato, es decir, bloque de código o link de GitHub, no ambos.',
      })
    )
    .buildToObject();
