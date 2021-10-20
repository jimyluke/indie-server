const axios = require("axios").default;
const fs = require("fs");
const JWPlatformAPI = require("jwplatform");
require("dotenv/config");

const BaseURL = `${process.env.JWP_BASEURL}/${process.env.JWP_SITEID}`;
const JWP_TOKEN = process.env.JWP_TOKEN;

const jwApiInstance = new JWPlatformAPI({
  apiKey: process.env.JWP_SITEID,
  apiSecret: process.env.JWP_SECRET,
});

exports.uploadVideo = async (req, res, next) => {
  const data = req.body;

  try {
    const resp = await jwApiInstance.upload(
      {
        title: data.title,
        description: data.description,
        author: req.user.username,
        category: "Movies",
        upload_method: "single",
        tags: data.genres,
        "custom.award": data.award,
        "custom.director": data.director,
        "custom.cast": data.cast,
        "custom.release_date": data.release_date,
      },
      req.file.path
    );
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.send({ result: resp.data });
  } catch (err) {
    if (err.response) {
      console.log(err.response.data);
    } else {
      console.log(err);
    }
    return next(err);
  }
};

exports.uploadVideoFromURL = async (req, res, next) => {
  const data = req.body;
  try {
    const options = {
      method: "POST",
      url: `${BaseURL}/media/`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: JWP_TOKEN,
      },
      data: {
        upload: {
          method: "fetch",
          download_url: data.video_url,
        },
        metadata: {
          title: data.title,
          description: data.description,
          author: data.author,
          permalink: data.permalink,
          category: "Movies",
          tags: data.genres,
          custom_params: { param1: "value1" },
        },
      },
    };

    const resp = await axios.request(options);
    return res.send({ result: resp.data });
  } catch (err) {
    if (err.response) {
      console.log(err.response.data);
    } else {
      console.log(err);
    }
    return next(err);
  }
};

exports.updateVideo = async (req, res, next) => {
  try {
    const data = req.body;
    const options = {
      method: "PATCH",
      url: `${BaseURL}/media/${data.id}`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: JWP_TOKEN,
      },
      data: {
        metadata: {
          title: data.title,
          description: data.description,
          author: req.user.username,
          category: "Movies",
          tags: data.genres,
          custom_params: {
            award: data.award,
            director: data.director,
            cast: data.cast,
            release_date: data.release_date,
          },
        },
      },
    };
    const resp = await axios.request(options);
    return res.send(resp.data);
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

exports.fetchVideoList = async (req, res, next) => {
  const query = req.query.query;

  try {
    const options = {
      method: "GET",
      url: `${BaseURL}/media/`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: JWP_TOKEN,
      },
      params: {
        page: "1",
        page_length: "10",
        sort: "created:dsc",
        q: query,
      },
    };

    const resp = await axios.request(options);
    return res.send({ result: resp.data });
  } catch (err) {
    if (err.response) {
      console.log(err.response.data);
    } else {
      console.log(err);
    }
    return next(err);
  }
};

exports.fetchMyList = async (req, res, next) => {
  try {
    const options = {
      method: "GET",
      url: `${BaseURL}/media/`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: JWP_TOKEN,
      },
      params: {
        page: "1",
        page_length: "20",
        sort: "created:dsc",
        q: `author:${req.user.username}`,
      },
    };

    const resp = await axios.request(options);
    return res.send({ result: resp.data });
  } catch (err) {
    if (err.response) {
      console.log(err.response.data);
    } else {
      console.log(err);
    }
    return next(err);
  }
};

exports.fetchVideoById = async (req, res, next) => {
  try {
    const mediaId = req.params.media_id;
    const options = {
      method: "GET",
      url: `${BaseURL}/media/${mediaId}`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: JWP_TOKEN,
      },
    };

    const resp = await axios.request(options);
    return res.send({ result: resp.data });
  } catch (err) {
    if (err.response) {
      console.log(err.response.data);
    } else {
      console.log(err);
    }
    return next(err);
  }
};

exports.searchVideos = async (req, res, next) => {
  const query = req.query.query;
  try {
    const resp = await jwApiInstance.videos.list({
      "search:*,custom.*": query,
    });
    return res.send({ result: resp });
  } catch (err) {
    if (err.response) {
      console.log(err.response.data);
    } else {
      console.log(err);
    }
    return next(err);
  }
};
