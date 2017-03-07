var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var serverPort = '4500';

app.get('/read/:wiredUrl', function (req, res) {
  var url = decodeURIComponent(req.params.wiredUrl);
  var article = '';
  var dd = [];
  request(url, function (error, response, html) {
    if (!error) {
      var $ = cheerio.load(html);


      if ($('body').hasClass('feature-story-layout')) {
        // other scraper

        var sections = $('section').map((index, section) => {
          dd.push($(section).html());
        });
        article = dd.join('');

      } else {

        article = $('article').html();
      }
    }
    res.send(article)
  })
})

app.get('/', function (req, res) {

  var urls = [
    'https://www.wired.com/',
    'https://www.wired.com/category/business/',
    'https://www.wired.com/category/culture/',
    'https://www.wired.com/category/design/',
    'https://www.wired.com/category/gear/',
    'https://www.wired.com/category/science/',
    'https://www.wired.com/category/security/',
    'https://www.wired.com/category/transportation/',
  ]

  var article = "";
  var promises = [];
  for (var i = 0; i < urls.length; i++) {
    var url = urls[i];
    var p = new Promise(function (fulfill, reject) {
      request(url, function (error, response, html) {
        if (!error) {
          var dd = [];
          var $ = cheerio.load(html);
          var cards = $('[itemtype="http://schema.org/Article"]');
          cards.map(function (index, el) {
            var addr = $(el).find('a').attr('href');
            dd.push(
              "<li><a href='/read/" + encodeURIComponent(addr) + "'>" + addr + "</a></li>"
            );
          })
          fulfill(dd);
        } else {
          reject(err);
        }
      })
    });
    promises.push(p)
  }
  Promise.all(promises).then(
    function (dd) {
      for (var i = 0; i < dd.length; i++){
      var listItems = dd[i].filter(function (elem, pos) {
        return dd[i].indexOf(elem) == pos;
      })
      article += "<ul>" + listItems.join('') + "</ul>";
      }
      res.send(article)
    }
  )
})

app.listen(serverPort);

exports = module.exports = app;