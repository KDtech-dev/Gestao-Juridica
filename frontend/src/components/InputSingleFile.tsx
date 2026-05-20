import { MouseEventHandler } from 'react'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography, { TypographyProps } from '@mui/material/Typography'
import { useDropzone } from 'react-dropzone'
import { Chip, IconButton, Stack, Tooltip } from '@mui/material'
import { Icon, type IconProps } from '@/components/AppIcon'
import { BoxProps } from '@mui/system'
import { visualizarArquivo } from '@/@core/utils/funcoes-de-arquivo'
import { toast } from '@/utils/toast'
import type { PublicacaoAnexo } from '@/api/publicacoes/types'

const HeadingTypography = styled(Typography)<TypographyProps>(({ theme }) => ({
  marginBottom: 0,
  [theme.breakpoints.down('sm')]: {
    marginBottom: 0
  }
}))

type props = {
  onFileChange?: (event: File | undefined) => void
  onFilesChange?: (files: File[]) => void
  value?: File
  values?: File[]
  multiple?: boolean
  cropImage?: boolean
  minWidth?: number
  maxWidth?: number
  onlyView?: boolean
  aspect?: number
  subBoxInput?: BoxProps
  iconProps?: Omit<IconProps, 'icon'>
  tipos_aceitos?: string[]
  maxSize?: number
  existingFileName?: string
  existingFileUrl?: string
  existingFiles?: PublicacaoAnexo[]
  onRemoveExisting?: () => void
  onRemoveExistingFile?: (id: string) => void
  label?: string
  helperText?: string
} & BoxProps

const FILE_MIME_BY_EXTENSION: Record<string, string> = {
  csv: 'text/csv',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  pdf: 'application/pdf',
  png: 'image/png'
}

const buildAcceptedFiles = (extensions: string[]) =>
  extensions.reduce<Record<string, string[]>>((accepted, extension) => {
    const mime = FILE_MIME_BY_EXTENSION[extension] ?? `application/${extension}`

    accepted[mime] = [...(accepted[mime] ?? []), `.${extension}`]

    return accepted
  }, {})

const InputSingleFile = ({
  onFileChange,
  onFilesChange,
  value,
  values,
  multiple = false,
  subBoxInput,
  onlyView,
  iconProps,
  tipos_aceitos,
  maxSize,
  existingFileName,
  existingFileUrl,
  existingFiles,
  onRemoveExisting,
  onRemoveExistingFile,
  label = 'Anexo',
  helperText = 'Solte o arquivo aqui ou clique para navegar.',
  ...props
}: props) => {
  const selectedFiles = multiple ? values ?? [] : value ? [value] : []
  const hasSelectedFile = selectedFiles.length > 0
  const currentExistingFiles = multiple ? existingFiles ?? [] : []
  const hasExistingFile = Boolean(existingFileName) || currentExistingFiles.length > 0

  const { getRootProps, getInputProps } = useDropzone({
    multiple,
    accept: tipos_aceitos ? buildAcceptedFiles(tipos_aceitos) : undefined,
    onDrop: (arquivoAceito: File[]) => {
      if (!onlyView) {
        const arquivosValidos = arquivoAceito.filter(arquivo => {
          if (maxSize && arquivo.size > maxSize) {
            toast.error(`O tamanho máximo permitido é de ${(maxSize / (1024 * 1024)).toFixed(0)} MB`)

            return false
          }

          const extensao = arquivo.name.split('.').pop()?.toLowerCase() || ''
          if (!tipos_aceitos || tipos_aceitos.includes(extensao)) {
            return true
          }

          toast.error(`Este arquivo não é aceito. São aceitos apenas os tipos: .${tipos_aceitos.join(', .')}`)

          return false
        })

        if (arquivosValidos.length === 0) return

        if (multiple) {
          onFilesChange?.([...selectedFiles, ...arquivosValidos])
          return
        }

        onFileChange?.(arquivosValidos[0])
      }
    }
  })

  const handleDeleteImage: MouseEventHandler<HTMLButtonElement> = e => {
    e.stopPropagation()
    if (!onlyView) {
      if (value) onFileChange?.(undefined)
      else if (existingFileName && onRemoveExisting) onRemoveExisting()
    } else {
      if (value) visualizarArquivo(value)
      else if (existingFileUrl) window.open(existingFileUrl, '_blank')
    }
  }

  const handleOpenFile = (file?: File) => {
    if (file) {
      visualizarArquivo(file)
    } else if (value) {
      visualizarArquivo(value)
    } else if (existingFileUrl) {
      window.open(existingFileUrl, '_blank')
    }
  }

  const handleDeleteFile = (index: number): MouseEventHandler<HTMLButtonElement> => e => {
    e.stopPropagation()

    if (onlyView) {
      handleOpenFile(selectedFiles[index])
      return
    }

    if (multiple) {
      onFilesChange?.(selectedFiles.filter((_, fileIndex) => fileIndex !== index))
      return
    }

    handleDeleteImage(e)
  }

  return (
    <Box {...props} sx={hasSelectedFile ? { height: 'auto', ...props.sx } : props.sx}>
      <input {...getInputProps()} />
      <Box
        {...subBoxInput}
        {...(onlyView ? undefined : getRootProps({ className: 'dropzone' }))}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '150px',
          border: '1.5px dashed',
          borderColor: hasSelectedFile || hasExistingFile ? 'primary.main' : 'divider',
          borderRadius: 2,
          bgcolor: hasSelectedFile || hasExistingFile ? 'action.selected' : 'background.default',
          cursor: onlyView ? 'default' : 'pointer',
          p: { xs: 2, md: 2.5 },
          transition: 'border-color 160ms ease, background-color 160ms ease',
          '&:hover': onlyView
            ? undefined
            : {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              },
          ...subBoxInput?.sx
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            width: '100%',
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          <IconButton
            sx={{
              width: 58,
              height: 58,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Icon icon='mdi:file-upload-outline' width='30' height='30' {...iconProps} />
          </IconButton>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <HeadingTypography variant='subtitle1' fontWeight={700}>
              {label}
            </HeadingTypography>
            <Typography
              variant='body2'
              color='textSecondary'
            >
              {helperText}
            </Typography>
            {tipos_aceitos && (
              <Stack direction='row' spacing={0.75} flexWrap='wrap' useFlexGap sx={{ mt: 1 }}>
                {tipos_aceitos.map(tipo => (
                  <Chip key={tipo} label={`.${tipo}`} size='small' variant='outlined' />
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      </Box>
      {hasSelectedFile && (
        <Stack spacing={1} sx={{ mt: 1 }}>
          {selectedFiles.map((file, index) => (
            <Box
              key={`${file.name}-${file.lastModified}-${index}`}
              sx={{
                width: '100%',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                px: 1.5,
                py: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography
                sx={{ maxWidth: '80%', overflow: 'hidden', cursor: 'pointer', ':hover': { color: 'rgb(0, 166, 90)' } }}
                title={file.name}
                onClick={() => handleOpenFile(file)}
              >
                {file.name}
              </Typography>
              <IconButton sx={{ marginRight: '8px', marginLeft: '20px' }} onClick={handleDeleteFile(index)}>
                {onlyView ? <Icon icon='mdi:eye-outline' /> : <Icon icon='mdi:delete-outline' width='1em' height='1em' />}
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}
      {currentExistingFiles.length > 0 && (
        <Stack spacing={1} sx={{ mt: 1 }}>
          {currentExistingFiles.map((file) => (
            <Box
              key={file.id}
              sx={{
                width: '100%',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                px: 1.5,
                py: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography
                sx={{
                  flex: 1,
                  minWidth: 0,
                  pr: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  ':hover': { color: 'rgb(0, 166, 90)' }
                }}
                title={file.nome}
                onClick={() => file.viewUrl && window.open(file.viewUrl, '_blank')}
              >
                {file.nome || 'Anexo da publicação'}
              </Typography>
              <Stack direction='row' spacing={0.5} flexShrink={0}>
                <Tooltip title='Visualizar'>
                  <IconButton
                    onClick={e => {
                      e.stopPropagation()
                      if (file.viewUrl) window.open(file.viewUrl, '_blank')
                    }}
                  >
                    <Icon icon='mdi:eye-outline' width='1em' height='1em' />
                  </IconButton>
                </Tooltip>
                {!onlyView && (
                  <Tooltip title='Remover'>
                    <IconButton
                      onClick={e => {
                        e.stopPropagation()
                        onRemoveExistingFile?.(file.id)
                      }}
                    >
                      <Icon icon='mdi:delete-outline' width='1em' height='1em' />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
      {!hasSelectedFile && existingFileName && (
        <Box
          sx={{
            width: '100%',
            mt: 1,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            px: 1.5,
            py: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography
            sx={{ maxWidth: '80%', overflow: 'hidden', cursor: 'pointer', ':hover': { color: 'rgb(0, 166, 90)' } }}
            title={existingFileName}
            onClick={() => existingFileUrl && window.open(existingFileUrl, '_blank')}
          >
            {existingFileName}
          </Typography>
          <IconButton sx={{ marginRight: '8px', marginLeft: '20px' }} onClick={handleDeleteImage}>
            {onlyView ? <Icon icon='mdi:eye-outline' /> : <Icon icon='mdi:delete-outline' width='1em' height='1em' />}
          </IconButton>
        </Box>
      )}
    </Box>
  )
}

export default InputSingleFile
