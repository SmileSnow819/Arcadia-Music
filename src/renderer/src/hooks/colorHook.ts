async function getAverageRGB(imageUrl): Promise<Array<number>> {
  // Step 1: Fetch the image data
  const response = await fetch(imageUrl)
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)

  // Step 2: Create an image element and load the image
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = async () => {
      // Step 3: Create a canvas and draw the image on it
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
      ctx.drawImage(img, 0, 0)

      // Step 4: Get the image data and calculate the average brightness
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      let averageRGB = [0, 0, 0] as Array<number>
      for (let i = 0; i < data.length; i += 4) {
        averageRGB[0] += data[i]
        averageRGB[1] += data[i + 1]
        averageRGB[2] += data[i + 2]
      }
      averageRGB = averageRGB.map((item) => item / (data.length / 4))
      // Clean up
      URL.revokeObjectURL(url)

      // Resolve the promise with the result
      resolve(averageRGB)
    }
    img.onerror = (error) => {
      reject(error)
    }
    img.src = url
  })
}

export { getAverageRGB }
