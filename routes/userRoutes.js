const express = require('express');
const router = express.Router();
const { getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword } = require('../controllers/userController');
const { authenticateUser, authPermission } = require('../middleware/authentication');

router.route('/').get(authenticateUser, authPermission('admin'), getAllUsers);
// # orders matters
router.route('/showMe').get(authenticateUser, showCurrentUser);
router.route('/updateUser').patch(authenticateUser, updateUser);
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword);
router.route('/:id').get(authenticateUser, getSingleUser);

module.exports = router;

//if the current user is below the getsingle user then the params in the current user sets the id of that params
//here we pass the authentiate user to the getalluser and getsingleuswer as only when the user token is there user can fetch the data or he cant

//if the id is aboove any routes with the same structure then that route i.e for ex; '/:showMe' after the /:id route will take the id as showme for the get req of the showme route
