const requiredEnv = (key) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} 환경변수가 설정되지 않았습니다.`);
  }

  return value;
};

module.exports = {
  host: requiredEnv("DB_HOST"),
  port: Number(process.env.DB_PORT || 3306),
  user: requiredEnv("DB_USER"),
  password: requiredEnv("DB_PASSWORD"),
  database: requiredEnv("DB_NAME"),
};
