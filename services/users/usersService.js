const UserModel = require("../../models/user")



const getAllUsers = async () => {
    return await UserModel.find({}, { 'user_id': true, 'email': true, })
}

module.exports = {
    getAllUsers
}