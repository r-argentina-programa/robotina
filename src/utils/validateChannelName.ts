export const validateChannelName = (channelName: string) => {
  const lessonRegEx = /clase+-[0-9]/

  if (lessonRegEx.test(channelName)) {
    const splittedChannelName = channelName.split('-')[1]
    return splittedChannelName
  }
  return false
}
