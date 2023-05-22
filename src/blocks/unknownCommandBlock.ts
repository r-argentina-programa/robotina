import { Blocks, Message } from 'slack-block-builder';

export const unknownCommandBlock = () =>
  Message({ text: 'unknown-command-alter' })
    .blocks(
      Blocks.Header({
        text: '🔎 Comando inválido / no encontrado.',
      }),
      Blocks.Divider(),
      Blocks.Section({
        text: 'Perdón, parece que el comando que usaste no está en este canal o el valor que pasaste no es válido.',
      })
    )
    .buildToObject();
