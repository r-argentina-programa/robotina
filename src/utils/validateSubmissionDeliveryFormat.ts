interface IValidateSubmissionDeliveryFormat {
  classNumber: number
  delivery: string
}

export const validateSubmissionDeliveryFormat = ({
  classNumber,
  delivery,
}: IValidateSubmissionDeliveryFormat) => {
  const FIRST_LINK_FORMAT_LESSON_NUMBER = 5
  const codeFormatRegex = /^```([a-zA-Z])*?\n*?([\s\S]*?)```$/
  const linkFormatRegex = /github\.com\/[a-zA-Z]/
  if (
    classNumber < FIRST_LINK_FORMAT_LESSON_NUMBER &&
    codeFormatRegex.test(delivery)
  ) {
    return true
  } else if (
    classNumber >= FIRST_LINK_FORMAT_LESSON_NUMBER &&
    linkFormatRegex.test(delivery)
  ) {
    return true
  } else {
    return false
  }
}
