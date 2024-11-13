function goTo(offset = 0, options) {
  const scrollContainer = document.querySelector(options.container) as HTMLElement
  setTimeout(
    () =>
      scrollContainer.scrollTo({
        top: offset,
        behavior: 'smooth'
      }),
    options.duration
  )
}

export { goTo }
