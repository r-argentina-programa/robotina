interface IValidateSubmissionDeliveryFormat {
  classNumber: number
  delivery: string
}

export const validateSubmissionDeliveryFormat = ({
  classNumber,
  delivery,
}: IValidateSubmissionDeliveryFormat) => {
  const FIRST_LINK_FORMAT_LESSON_NUMBER = 5
  const linkFormatRegex = /github\.com\/[a-zA-Z]/
  if (classNumber < FIRST_LINK_FORMAT_LESSON_NUMBER) {
    return true
  }
  if (
    classNumber >= FIRST_LINK_FORMAT_LESSON_NUMBER &&
    linkFormatRegex.test(delivery)
  ) {
    return true
  }
  return false
}
