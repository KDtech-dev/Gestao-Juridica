const baixarArquivo = (fileUrl: string, nome: string) => {
  const a = document.createElement('a')
  a.href = fileUrl
  a.download = nome
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export const visualizarArquivo = (arquivo: File) => {
  const fileUrl = URL.createObjectURL(arquivo)

  const tipos_visualizaveis_navegador = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']

  if (tipos_visualizaveis_navegador.includes(arquivo.type)) {
    const openedWindow = window.open(fileUrl, '_blank')

    if (openedWindow) {
      const revokeUrl = () => {
        URL.revokeObjectURL(fileUrl)
        openedWindow.removeEventListener('beforeunload', revokeUrl)
        window.removeEventListener('pagehide', revokeUrl)
      }

      openedWindow.addEventListener('beforeunload', revokeUrl)
      window.addEventListener('pagehide', revokeUrl, { once: true })
    } else {
      baixarArquivo(fileUrl, arquivo.name)
      URL.revokeObjectURL(fileUrl)
    }
  } else {
    baixarArquivo(fileUrl, arquivo.name)
    URL.revokeObjectURL(fileUrl)
  }
}

export const downloadArquivo = (arquivo: File) => {
  const fileUrl = URL.createObjectURL(arquivo)
  baixarArquivo(fileUrl, arquivo.name)
  URL.revokeObjectURL(fileUrl)
}

export const verificarTamanho = (arquivo: File, tamanhoMaximo: number) => {
  return arquivo.size <= tamanhoMaximo
}

export const arquivosIguais = (arquivoA: File, arquivoB: File) => {
  return arquivoA.name == arquivoB.name && arquivoA.size == arquivoB.size
}
