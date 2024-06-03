export default () => ({
  PORT: parseInt(process.env.PORT),
  JWT_SECRET: process.env.JWT_SECRET,
  DB_CONFIG: {
    uri: process.env.DB_URI,
    dbName: process.env.DB_NAME,
  },
  API_CPE: process.env.BASE_API_CPE,
});
