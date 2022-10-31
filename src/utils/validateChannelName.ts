export const validateChannelName = (channelName: string) => {
  const lessonRegEx = /^clase/

  if (lessonRegEx.test(channelName)) {
    const splittedChannelName = channelName.split('-')
    return splittedChannelName[1] === 'react'
      ? `10${splittedChannelName[2]}`
      : splittedChannelName[1]
  }
  return false
}
