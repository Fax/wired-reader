var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();


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
  var url = "https://www.wired.com/";
  var article = "";
  var dd = [];
  request(url, function (error, response, html) {
    if (!error) {
      var $ = cheerio.load(html);

      
      var cards = $('[itemtype="http://schema.org/Article"]');//.find('a').attr('href');
      cards.map(function (index, el) {
        var addr = $(el).find('a').attr('href');

        dd.push(
          "<li><a href='/read/" +
          encodeURIComponent(addr)+ "'>"+addr+"</a></li>"

        );
      })
      article = "<ul>" + dd.join('') + "</ul>";
    }
    res.send(article)
  })
})

app.listen('4500');

exports = module.exports = app;