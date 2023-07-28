//import { connectToNetwork, connectToRouter } from "@ndn/autoconfig";
import { Endpoint } from "@ndn/endpoint";
import { AltUri, Interest, Name } from "@ndn/packet";
import { WsTransport } from "@ndn/ws-transport";
//import { json } from "body-parser";

async function ping(evt) {
  evt.preventDefault();
  // Disable the submit button during function execution.
  const $button = document.querySelector("#app_button");
  $button.disabled = true;

  // Construct the name prefix <user-input>+/ping
  const prefix = new Name("data/getuser");
  const app = document.querySelector("#app_param").value;
  const $log = document.querySelector("#app_log");
  //$log.textContent = `Check Data \n${AltUri.ofName(prefix)}\n`;

  const endpoint = new Endpoint();
  const encoder = new TextEncoder();
  const interest = new Interest();
  const decoder = new TextDecoder();
  // Generate a random number as initial sequence number.
  
  // Construct an Interest with prefix + seqNum.
  //const interest = new Interest();
  interest.name = prefix;
  interest.mustBeFresh = true; 
  interest.lifetime = 1000;
  interest.appParameters = encoder.encode(app);
  //$log.textContent += `\n${encoder.encode(app)}\n`;
  const t0 = Date.now();
  await interest.updateParamsDigest();
  
  try {
    // Retrieve Data and compute round-trip time.
    const data = await endpoint.consume(interest);
    const rtt = Date.now() - t0;
    const dataContent = data.content;
    
    console.log(dataContent);
    console.log('${rtt} ms');
    //Parse JSON and Stringfy
    const jsonData = JSON.parse(decoder.decode(dataContent));
    //Access the First Object inside JSON array
    const properties = Object.entries(jsonData[0]);
    //Display JSON data to HTML
    let jsonDataString = "";
    for (const [key, value] of properties) {
      jsonDataString += `${key}: ${value}\n`;
    }
    const $outputJson = document.querySelector("#output_json");
    $outputJson.textContent = jsonDataString;

    //$log.textContent += `${AltUri.ofName(data.name)} rtt= ${rtt}ms content= ${String.fromCharCode(...dataContent)}\n`;
    //console.log(`${rtt} ms`);
  } catch(err) {
    // Report Data retrieval error.
    console.log("Error", err)
    //$log.textContent += `\n${AltUri.ofName(interest.name)} ${err}`;
  } finally {
    // Re-enable the submit button.
    $button.disabled = false;
  }
}

async function main() {
  // Connect to the global NDN network in one line.
  // This function queries the NDN-FCH service, and connects to the nearest router.
  //await WsTransport.createFace({}, "wss://ndn-ehealth.australiaeast.cloudapp.azure.com");
  const face = await WsTransport.createFace({}, "wss://scbe.ndntel-u.my.id:9696");
  //await WsTransport.createFace({}, "wss://20.92.254.187:9696/");
  //await WsTransport.createFace({}, "wss://104.21.31.135:9696/");
  face.addRoute(new Name("/"));
  //await connectToRouter("wss://192.168.56.106:9696/ws/", {});
  //await WsTransport.createFace({}, "wss://testbed-ndn-rg.stei.itb.ac.id/ws/");
  //await WsTransport.createFace({}, "ws://192.168.56.111:9696/ws/");
  //await WsTransport.createFace({}, "ws://coba.ndntel-u.my.id/ws/");

  // Enable the form after connection was successful.
  document.querySelector("#app_button").disabled = false;
  document.querySelector("#app_form").addEventListener("submit", ping);
}

window.addEventListener("load", main);
