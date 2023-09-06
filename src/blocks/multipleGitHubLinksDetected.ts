import { Blocks, Message } from 'slack-block-builder';

export const multipleGitHubLinksDetected = () =>
  Message()
    .blocks(
      Blocks.Header({
        text: '❌ Formato inválido.',
      }),
      Blocks.Divider(),
      Blocks.Section({
        text: 'Asegurate de mandar la tarea en un solo link de GitHub, no en varios.',
      })
    )
    .buildToObject();
