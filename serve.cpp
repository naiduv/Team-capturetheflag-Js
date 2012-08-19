#include <stdio.h>
#include <sys/types.h> 
#include <sys/socket.h>
#include <netinet/in.h>
#include <string.h>
#include <iostream>
#include <fstream>
#include "./sha1.h"
#include "./base64.h"

using namespace std;

int main( int argc, char *argv[] )
{
  socklen_t sockfd, newsockfd, portno, clilen;
  char buffer[1024];
  struct sockaddr_in serv_addr, cli_addr;
  int  n;

  /* First call to socket() function */
  sockfd = socket(AF_INET, SOCK_STREAM, 0);
  if (sockfd < 0) 
    {
      cout<<"\nERROR opening socket";
      return(0);
    }
  /* Initialize socket structure */
  memset((char *) &serv_addr, 0, sizeof(serv_addr));
  portno = 5001;
  serv_addr.sin_family = AF_INET;
  serv_addr.sin_addr.s_addr = INADDR_ANY;
  serv_addr.sin_port = htons(portno);
 
  /* Now bind the host address using bind() call.*/
  if (bind(sockfd, (struct sockaddr *) &serv_addr,
	   sizeof(serv_addr)) < 0)
    {
      cout<<"\nERROR on binding";
      return(0);
    }

  /* Now start listening for the clients, here process will
   * go in sleep mode and will wait for the incoming connection
   */
  while(1) {
    cout<<"\n***New listen cycle***\n";
    listen(sockfd,5);
    clilen = sizeof(cli_addr);

    /* Accept actual connection from the client */
    newsockfd = accept(sockfd, (struct sockaddr *)&cli_addr, 
		       &clilen);

    if (newsockfd < 0) 
      {
	cout<<"\nERROR on accept";
	return(0);
      }

    /* If connection is established then start communicating */
    memset(buffer, 0, sizeof(buffer));
    n = read(newsockfd,buffer,sizeof(buffer));
    if (n < 0){
      cout<<"\nERROR reading from socket";
      return(0);
    }

    if(strlen(buffer)==0) {
      cout<<"\n buffer empty";
      continue;
    }

    cout<<buffer;
    
    char keyhead[] ="Sec-WebSocket-Key: ";
    char *ptr1 = strstr(buffer,keyhead);
    char verhead[] = "Sec-WebSocket-Version: ";
    char* ptr2 = strstr(buffer, verhead);

    int key_len = strlen(ptr1)-strlen(ptr2)-strlen(keyhead)-2;

    char key[1000];
    strncpy(key, ptr1+strlen(keyhead), key_len);
    key[key_len-2] = '\0';
    cout<<"\nkey: "<<key;
    cout<<"<<key";

    char guid[] = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    strcat(key, guid);

    cout<<"\ncatkey:"<<key;

    unsigned char hash[20];
    sha1::calc(key, strlen(key), hash);
    cout<<"\nhash : "<<hash;

    string keystr(key);
    string response = "HTTP/1.1 101 Switching Protocols\r\n";
    response.append("Upgrade: websocket\r\n");
    response.append("Connection: Upgrade\r\n");
    response.append("Sec-WebSocket-Accept: " + keystr + "\r\n\r\n");

    n = write(newsockfd,response.c_str(),response.length());
    if (n < 0) {
      cout<<"\nERROR writing to socket";
      return(0);
    }

    cout<<response;

	      // close(newsockfd);
	      //cout<<"\n closing socket \n";
  }

  return 0; 
}
