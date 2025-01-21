const { app,port } = require("./src/main/main")

const {
    sequelize
} = require("./src/config/db")


console.log(sequelize)
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
