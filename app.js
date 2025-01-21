const { app,port } = require("./src/main/main")
require('dotenv').config();

const sequelize = require("./src/config/db")

sequelize
  .authenticate()
  .then(() => console.log('Database connected successfully'))
  .catch((error) => console.error('Unable to connect to the database:', error));
  
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
