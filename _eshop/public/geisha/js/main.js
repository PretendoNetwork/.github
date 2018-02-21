var gameContainer = document.querySelector('.gamesapps');
var gameSample = `
  <div class="game">
    <div class="gameTop" style="background: url('LINKIMG'); background-size: cover; background-position: center;"><button class="backbutton" onclick="alert('hoi')"><--</button></div>
    <div class="gameMid">
      <h3>GTITLE</h3>
      <div class="pricing"><div class="currensign">$</div><div class="price">PRICE</div></div>
    </div>
    <div class="itemsHidden">
      <button>Buy Now</button>
      <h3>STITLE</h3>
      <p>
        DESCRIPTION
      </p>
      <h3>More information</h3>
      <p>QINFO</p>
    </div>
  </div>
`

var gameList = [
  {
    "title": "Ducktales: remastered",
    "subtitle": "Apparently there's a game",
    "description": "DuckTales: Remastered is a Metroidvania style[6] platform video game developed by WayForward Technologies and published by Capcom and Disney Interactive Studios. The game is a high-definition remake of DuckTales, a game released on the Nintendo Entertainment System in 1989. It was released for multiple gaming platforms, including the PlayStation 3, the Xbox 360, and the Wii U, over a three-month period between August and November 2013, and later expanded to iOS, Android, and Windows Phone in April 2015.",
    "price": "11.99",
    "info": "Not yet",
    "img": "https://lumiere-a.akamaihd.net/v1/images/open-uri20150608-27674-16j1ths_a500806c.jpeg?region=0,0,1024,430"
  },
  {
    "title": "Minecraft",
    "subtitle": "Why tf is this a thing",
    "description": "BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS ",
    "price": "15.99",
    "info": "Not yet",
    "img": "https://compass-ssl.xbox.com/assets/0f/e2/0fe20042-0bb8-4781-82f4-7130f928b021.jpg?n=Minecraft-2017_Superhero-0_Keyart_767x431.jpg"
  },
  {
    "title": "Splatoon 2",
    "subtitle": "How fun",
    "description": "Two years have passed since the original Splatoon™ game was released, and two years have also passed in Inkopolis! So expect a fresh wave of fashion, not to mention new weapons and gear. Dual wield the new Splat Dualies or stick to mainstays like chargers and rollers, which have been remixed with new strategic possibilities. As always, Turf War is the favored sport among Inklings, but they also dig ranked battles, taking down Octarians in a robust single-player campaign, and battling enemy Salmonids in one dangerous part-time job! No matter which way you play, splat at home or on-the-go with Nintendo Switch. Staying fresh never felt so good.",
    "price": "59.99",
    "info": "Not yet",
    "img": "https://cdn02.nintendo-europe.com/media/images/10_share_images/games_15/nintendo_switch_4/H2x1_NSwitch_Splatoon2_image1600w.jpg"
  },
  {
    "title": "Celeste",
    "subtitle": "Apparently this is a gud game",
    "description": "DuckTales: Remastered is a Metroidvania style[6] platform video game developed by WayForward Technologies and published by Capcom and Disney Interactive Studios. The game is a high-definition remake of DuckTales, a game released on the Nintendo Entertainment System in 1989. It was released for multiple gaming platforms, including the PlayStation 3, the Xbox 360, and the Wii U, over a three-month period between August and November 2013, and later expanded to iOS, Android, and Windows Phone in April 2015.",
    "price": "19.99",
    "info": "Not yet",
    "img": "https://cdn3.dualshockers.com/wp-content/uploads/2017/02/Screen-Shot-2017-02-22-at-5.25.03-PM.png"
  },
  {
    "title": "Night in the woods",
    "subtitle": "Wooohhh scary",
    "description": "DuckTales: Remastered is a Metroidvania style[6] platform video game developed by WayForward Technologies and published by Capcom and Disney Interactive Studios. The game is a high-definition remake of DuckTales, a game released on the Nintendo Entertainment System in 1989. It was released for multiple gaming platforms, including the PlayStation 3, the Xbox 360, and the Wii U, over a three-month period between August and November 2013, and later expanded to iOS, Android, and Windows Phone in April 2015.",
    "price": "29.99",
    "info": "Not yet",
    "img": "http://cdn.edgecast.steamstatic.com/steam/apps/481510/header.jpg?t=1489689270"
  },
  {
    "title": "PUBG",
    "subtitle": "Why tf is this a thing",
    "description": "BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS BLOCKS ",
    "price": "29.99",
    "info": "Not yet",
    "img": "https://cdn.areajugones.es/wp-content/uploads/2017/09/Playerunknowns-Battlegrounds-810x400.jpg"
  },
  {
    "title": "Mario Kart 8 Deluxe",
    "subtitle": "How fun",
    "description": "Two years have passed since the original Splatoon™ game was released, and two years have also passed in Inkopolis! So expect a fresh wave of fashion, not to mention new weapons and gear. Dual wield the new Splat Dualies or stick to mainstays like chargers and rollers, which have been remixed with new strategic possibilities. As always, Turf War is the favored sport among Inklings, but they also dig ranked battles, taking down Octarians in a robust single-player campaign, and battling enemy Salmonids in one dangerous part-time job! No matter which way you play, splat at home or on-the-go with Nintendo Switch. Staying fresh never felt so good.",
    "price": "59.99",
    "info": "Not yet",
    "img": "https://cdn02.nintendo-europe.com/media/images/10_share_images/games_15/nintendo_switch_4/H2x1_NSwitch_MarioKart8Deluxe.jpg"
  },
  {
    "title": "Oxenfree",
    "subtitle": "Apparently this is a gud game",
    "description": "DuckTales: Remastered is a Metroidvania style[6] platform video game developed by WayForward Technologies and published by Capcom and Disney Interactive Studios. The game is a high-definition remake of DuckTales, a game released on the Nintendo Entertainment System in 1989. It was released for multiple gaming platforms, including the PlayStation 3, the Xbox 360, and the Wii U, over a three-month period between August and November 2013, and later expanded to iOS, Android, and Windows Phone in April 2015.",
    "price": "19.99",
    "info": "Not yet",
    "img": "https://images-2.gog.com/321b7922b42e5c88f91b34dbf09d09eedd455bfc3380872d438aff5913a3eb1e.jpg"
  }
]
var gameids = 0;
gameList.forEach(function(e) {
  var x = gameSample;
  x = x.replace(/QINFO/gi, e.info);
  x = x.replace(/GTITLE/gi, e.title);
  x = x.replace(/STITLE/gi, e.subtitle);
  x = x.replace(/PRICE/gi, e.price);
  x = x.replace(/DESCRIPTION/, e.description);
  x = x = x.replace(/LINKIMG/gi, e.img);
  gameContainer.innerHTML += x;
});

function view(e) {
  
  var games = document.getElementsByClassName("game");
  
  for(let i = games.length -1; i > -1; i--) {
    console.log(games[i]);
     if(e.indexOf(document.getElementsByClassName("game")[i]) > -1) {
       games[i].classList.add('opened');
     };  
  }
  
 
}

var els = document.getElementsByClassName("game");

Array.prototype.forEach.call(els, function(el) {
    // Do stuff here;
    //console.log(el);
    el.addEventListener("click", function(e) {
      if(document.querySelector('.opened')) {     
         document.getElementsByClassName('opened')[0].classList.remove("opened");
      }
      view(e.path);
    });
});