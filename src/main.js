import { Endpoint } from "@ndn/endpoint";
import { Interest, Name } from "@ndn/packet";
import { WsTransport } from "@ndn/ws-transport";

async function ping(evt) {
  evt.preventDefault();
  // Disable the submit button during function execution.
  const $button = document.querySelector("#app_button");
  $button.disabled = true;

  const prefix = new Name("/data/getuser");
  const app = document.querySelector("#app_param").value;
  const $log = document.querySelector("#app_log");

  const endpoint = new Endpoint();
  const encoder = new TextEncoder();
  const interest = new Interest();
  const decoder = new TextDecoder();
  
  interest.name = prefix;
  interest.mustBeFresh = true; 
  interest.lifetime = 1000;
  interest.appParameters = encoder.encode(app);
  const t0 = Date.now();
  await interest.updateParamsDigest();
  
  try {
    // Retrieve Data and compute round-trip time.
    const data = await endpoint.consume(interest);
    const rtt = Date.now() - t0;
    const dataContent = data.content;
    
    console.log(dataContent);
    console.log(`${rtt} ms`);
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

  } catch(err) {
    // Report Data retrieval error.
    console.log("Error", err)
  } finally {
    // Re-enable the submit button.
    $button.disabled = false;
  }
}

async function main() {
  const face = await WsTransport.createFace({}, "wss://scbe.ndntel-u.my.id:9696");
  face.addRoute(new Name("/"));


  // Enable the form after connection was successful.
  document.querySelector("#app_button").disabled = false;
  document.querySelector("#app_form").addEventListener("submit", ping);
}

window.addEventListener("load", main);
