import express from 'express'

const DEFAULT_PORT = 3001
const PORT_RADIX = 10
const HTTP_STATUS_OK = 200
const HTTP_STATUS_UNAUTHORIZED = 401
const HTTP_STATUS_NO_CONTENT = 204
const INVALID_CREDENTIALS_SAMPLE = 'invalid'
const SESSION_ID_PREFIX = 'sid'
const SESSION_ID_SEPARATOR = '-'
const EMPTY_VALUE = ''
const LOGIN_SANITIZE_PATTERN = /\s+/g

const app = express()

app.use(express.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.sendStatus(HTTP_STATUS_NO_CONTENT)
    return
  }

  next()
})

/**
 * Нормализует учетные данные пользователя.
 * @param credentials Объект с логином и паролем, полученный из запроса.
 * @returns Объект с логином и паролем без лишних пробелов.
 */
const normalizeCredentials = (credentials) => ({
  login: String(credentials?.login ?? EMPTY_VALUE).trim(),
  password: String(credentials?.password ?? EMPTY_VALUE).trim(),
})

/**
 * Формирует идентификатор сессии на основе логина.
 * @param login Логин пользователя.
 * @returns Строка SID, сформированная из префикса и нормализованного логина.
 */
const buildSessionId = (login) => {
  const sanitizedLogin = login.replace(LOGIN_SANITIZE_PATTERN, EMPTY_VALUE)
  return `${SESSION_ID_PREFIX}${SESSION_ID_SEPARATOR}${sanitizedLogin}`
}

/**
 * Проверяет, следует ли отклонить авторизацию как некорректную.
 * @param credentials Нормализованные логин и пароль пользователя.
 * @returns true, если логин или пароль некорректны.
 */
const isInvalidCredentials = (credentials) =>
  !credentials.login ||
  !credentials.password ||
  credentials.login === INVALID_CREDENTIALS_SAMPLE ||
  credentials.password === INVALID_CREDENTIALS_SAMPLE

app.post('/auth/login', (req, res) => {
  const normalized = normalizeCredentials(req.body)

  if (isInvalidCredentials(normalized)) {
    res.status(HTTP_STATUS_UNAUTHORIZED).json({ code: 'invalid_credentials' })
    return
  }

  res.status(HTTP_STATUS_OK).json({ sid: buildSessionId(normalized.login) })
})

const resolvePort = () => {
  const rawPort = process.env.PORT ?? EMPTY_VALUE
  const parsedPort = Number.parseInt(rawPort, PORT_RADIX)

  return Number.isNaN(parsedPort) ? DEFAULT_PORT : parsedPort
}

const port = resolvePort()

app.listen(port, () => {
  console.log(`Mock server is running on http://localhost:${port}`)
})
