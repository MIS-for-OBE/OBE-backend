export default () => ({
  port: parseInt(process.env.PORT),
  database: {
    uri: process.env.DATABASE_URI,
    name: process.env.DATABASE_NAME,
  },
  apiCpe: process.env.BASE_API_CPE,
  jwtSecret: process.env.JWT_SECRET,
});
