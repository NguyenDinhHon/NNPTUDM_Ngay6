var express = require('express');
var router = express.Router();

let userModel = require('../schemas/users');

router.get('/', async function (req, res) {
  let data = await userModel
    .find({
      isDeleted: false,
    })
    .populate({
      path: 'role',
      select: 'name',
    });
  res.send(data);
});

router.post('/enable', async function (req, res) {
  try {
    let email = req.body.email;
    let username = req.body.username;

    if (!email || !username) {
      return res.status(400).send({
        message: 'email and username are required',
      });
    }

    let user = await userModel.findOne({
      isDeleted: false,
      email: email,
      username: username,
    });

    if (!user) {
      return res.status(404).send({
        message: 'USER NOT FOUND',
      });
    }

    user.status = true;
    await user.save();

    let updated = await userModel.findById(user._id).populate({
      path: 'role',
      select: 'name',
    });

    res.send(updated);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

router.post('/disable', async function (req, res) {
  try {
    let email = req.body.email;
    let username = req.body.username;

    if (!email || !username) {
      return res.status(400).send({
        message: 'email and username are required',
      });
    }

    let user = await userModel.findOne({
      isDeleted: false,
      email: email,
      username: username,
    });

    if (!user) {
      return res.status(404).send({
        message: 'USER NOT FOUND',
      });
    }

    user.status = false;
    await user.save();

    let updated = await userModel.findById(user._id).populate({
      path: 'role',
      select: 'name',
    });

    res.send(updated);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

router.get('/:id', async function (req, res) {
  try {
    let id = req.params.id;
    let result = await userModel
      .find({
        isDeleted: false,
        _id: id,
      })
      .populate({
        path: 'role',
        select: 'name',
      });
    if (result.length) {
      res.send(result[0]);
    } else {
      res.status(404).send({
        message: 'ID NOT FOUND',
      });
    }
  } catch (error) {
    res.status(404).send({
      message: error.message,
    });
  }
});

router.post('/', async function (req, res) {
  try {
    let newUser = new userModel({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      status: req.body.status,
      role: req.body.role,
      loginCount: req.body.loginCount,
    });
    await newUser.save();
    res.send(newUser);
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).send({
        message: 'DUPLICATE KEY',
        error: error.keyValue,
      });
    }
    res.status(400).send({
      message: error.message,
    });
  }
});

router.put('/:id', async function (req, res) {
  try {
    let id = req.params.id;
    let existing = await userModel.findOne({
      isDeleted: false,
      _id: id,
    });
    if (!existing) {
      return res.status(404).send({
        message: 'ID NOT FOUND',
      });
    }
    let result = await userModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.send(result);
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).send({
        message: 'DUPLICATE KEY',
        error: error.keyValue,
      });
    }
    res.status(404).send({
      message: error.message,
    });
  }
});

router.delete('/:id', async function (req, res) {
  try {
    let id = req.params.id;
    let result = await userModel.findOne({
      isDeleted: false,
      _id: id,
    });
    if (result) {
      result.isDeleted = true;
      await result.save();
      res.send(result);
    } else {
      res.status(404).send({
        message: 'ID NOT FOUND',
      });
    }
  } catch (error) {
    res.status(404).send({
      message: error.message,
    });
  }
});

module.exports = router;
