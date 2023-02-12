/*This is about the famous film director Éric Rohmer. As a big fan, I am interested in how his life connects to his artworks.
His works show a meticulous observation of everyday life. The flow of emotions between people also touched me very much.
Therefore, I have chosen to scrape his photographs, the "new wave" as a backdrop for the times, and all links to his works.
 I have tried to use this as a starting point for visualization inspiration.

 steps:
 1.scrape the image of Éric Rohmer.
 2.scrape all the paragraphs including the background of "New Wave".
 3.scrape the links of his films.
*/
const https = require('https');
const JSSoup = require('jssoup').default;
const fs = require('fs');
const url = "https://en.wikipedia.org/wiki/%C3%89ric_Rohmer";//FIRST, find a url of a page on Wikipedia that you are interested in
const jsonPath = "./json/"; 
const imagePath = "./images/"; 
const name = "Éric Rohmer";


/*
This web-scraping example is set up for working with wikipedia.If you want to adapt this
to scrape another site you should go and inspect the site in the browser first, then adapt this. 
*/

//IMAGE: get all image urls from the soup
function getAllImages(soupTag){
    let imgs = soupTag.findAll('img');
    let imgUrls = [];

    for(let i = 0; i < imgs.length; i++){
        let attrs = imgs[i].attrs;// get a tag attributes
        // if there is an href attribute let's get it
        if('src' in attrs){
            let src = attrs.src;
            if(src.indexOf("wiki/Special:") == -1){ //these are not images
                if(src.indexOf("https:") == -1){
                    src = "https:"+src;
                }
                console.log(src);
                imgUrls.push(src);
            }
        }
    }

    return imgUrls;
}


//IMAGE: get all the image names and return as an array
function getImageNames(imageUrls){
    let imageFileNames = [];

    for(let i = 0; i < imageUrls.length; i++){
        imageFileNames.push(getName(imageUrls[i]));
    }

    return imageFileNames;
}

//split url on the "/" character and get the last element from 
//the returned array which will give us the file name
function getName(url){
    let parts = url.split("/");
    let name = parts[parts.length-1];
    return name;
}

//download images, pass in an array of urls
function recursiveDownload(imageUrlArray,i){
    
    //to deal with the asynchronous nature of a get request we get the next image on successful file save
    if (i < imageUrlArray.length) {
  
        //get the image url
        https.get(imageUrlArray[i], (res) => {
        
            //200 is a successful https get request status code
            if (res.statusCode === 200) {
                //takes the readable stream, the response from the get request, and pipes to a writeable stream
                res.pipe(fs.createWriteStream(imagePath+"/"+getName(imageUrlArray[i])))
                    .on('error', (e) => {
                        console.log(e);
                        recursiveDownload (imageUrlArray, i+1); //skip any failed ones
                    })
                    .once('close', ()  => {
                        console.log("File saved");
                        recursiveDownload (imageUrlArray, i+1); //download the next image
                    });
            } else {
                console.log(`Image Request Failed With a Status Code: ${res.statusCode}`);
                recursiveDownload (imageUrlArray, i+1); //skip any failed ones
            }

        });

    }
}

//BACKGROUND: get all the paragraphs including "new wave"
function getParagraphs(soupTag){
    let paragraphs = soupTag.findAll('p');
    let text = [];
    for(let i = 0; i < paragraphs.length; i++){
        let p = paragraphs[i].getText();

        if(p.indexOf("New Wave") != -1){
           console.log(p);
           text.push(p);
        } 
    }
    return text;
}

//FILM LINKS
function getFilmLinks(soupTag){
    let aTags = soupTag.findAll('a'); // return an array of SoupTag object
    let links = [];
   
    for(let i = 0; i < aTags.length; i++){
        let attrs = aTags[i].attrs;// get a tag attributes
        // if there is an href attribute let's get it
        if('href' in attrs){
            let hrefValue = attrs.href;
            if(hrefValue.indexOf('index.php') == -1 && hrefValue[0] != '#' ){
                //add the start 'https://en.wikipedia.org' to any internal wikipedia urls 
                if(hrefValue.indexOf('/wiki/') != -1 && hrefValue.indexOf('.org') == -1){
                    hrefValue = 'https://en.wikipedia.org'+hrefValue;
                }

                let text = aTags[i].getText();
                let link = {
                    "href": hrefValue,
                    "text": text
                };

                links.push(link);
            }else{
                // console.log(hrefValue);
            }
        }
 
    }

    return links;
}



//pass in Plain Old Javascript Object that's formatted as JSON
function writeJSON(data){
    try {
        let path = jsonPath+name+".json";
        fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
        console.log("JSON file successfully saved");
    } catch (error) {
        console.log("An error has occurred", error);
    }
}

//create soup  
function createSoup(document){
    let soup = new JSSoup(document);
    let data = {
        "name": name,
        "url": url,
        "content": {}
    }; 

    //let main = soup.find('main');//only get the content from the main tag of the page
    let bodyContent = soup.find('div', { id: 'bodyContent' });
    let images = getAllImages(bodyContent);//search for the a tag and return the urls
    let filmslinks = soup.find('div', { class: 'div-col'});

    data.content = {
        "imageNames": getImageNames(images),
        "background": getParagraphs(bodyContent),
        "links to the film": getFilmLinks(filmslinks)//store the array of image names in json file
    };
        
    //output json
    writeJSON(data);

    //download all images
    recursiveDownload(images, 0);
}


//Request the url
https.get(url, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);
    
    let document = [];

    res.on('data', (chunk) => {
        document.push(chunk);
    }).on('end', () => {
        document = Buffer.concat(document).toString();
        // console.log(body);
        createSoup(document);
    });

}).on('error', (e) => {
    console.error(e);
});

