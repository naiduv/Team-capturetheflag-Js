#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h> 
#include <sys/socket.h>
#include <netinet/in.h>
#include <string.h>
#include <iostream>
#include <fstream>
#include "./sha1.h"
#include "./base64.h"
#include <pthread.h>
#include <unistd.h>

using namespace std;
socklen_t sockfd, newsockfd, portno, clilen;

class game
{
  //each game has 2 sockets
  socklen_t sockets[2];
  string gameid;
};

void* listen_loop(void *ptr);
void* read_keyboard_loop(void *ptr);
void* close_socks_loop(void *ptr);
void* recv_loop(void *ptr);

int main( int argc, char *argv[] )
{
  cout<<"\n sizeof char : "<<sizeof(char);
  pthread_t listen_thread;
  pthread_t read_keyboard_thread;
  pthread_t close_socks_thread; 
  pthread_t recv_thread;


  int listenret = pthread_create(&listen_thread, NULL, listen_loop, (void*)NULL);
  int readkbret = pthread_create(&read_keyboard_thread, NULL, read_keyboard_loop, (void*)NULL);
  int closesockret = pthread_create(&close_socks_thread, NULL, close_socks_loop, (void*)NULL);
  int recvret = pthread_create(&recv_thread, NULL, recv_loop, (void*)NULL);
  cout<<"\n thread create completed";

  pthread_join(listen_thread, NULL);
  pthread_join(read_keyboard_thread, NULL);
  pthread_join(close_socks_thread, NULL);
  pthread_join(recv_thread, NULL);
}

bool g_force_exit = false;
void* read_keyboard_loop(void *ptr)
{
  cout<<"\n entering read keyb loop";
  string input = "empty";
  string exit = "exit";
  while(input!=exit){
    cin>>input;
  }
  g_force_exit = true;
  cout<<"\n exiting read_keyboard_loop! enter to complete";
  cin>>input;
}

void* recv_loop(void *ptr)
{
  cout<<"\n entering recv_loop";
  
  while(!g_force_exit){
    
    if(newsockfd){
      char *rb;
      
      //byte 0 -> fin, opcode
      recv(newsockfd, rb, 1, 0);
      bool fin = (bool)(*rb & 0x80);
      cout<<"\n fin: "<<fin;
     
      char opcode = *rb & 0x0F;
      
      if(opcode == 0x01)
        cout<<"\n opcode: text frame";
      else if(opcode == 0x08)
        cout<<"\n opcode: connection close";
      else
        cout<<"\n opcode: not handled";
     
      //byte 1 -> ismask, payload len
      recv(newsockfd, rb, 1, 0);
      char length = *rb & 0x7F;
      cout<<"\n length: "<<(*rb&0x7f);

      //byte 2-9 -> check 2-7 for extended payload
      recv(newsockfd, rb, 8, 0);

      //byte 10-13 -> masking
      recv(newsockfd, rb, 4, 0);
      char mask[4];
      mask[0] = *rb;
      mask[1] = *rb+1;
      mask[2] = *rb+2;
      mask[3] = *rb+3;

      //byte 14 - all -> payload 
      int data;
      for (int i = 0; i < length; i++) {
        recv(newsockfd, rb, 1, 0);
        data = (*rb ^ mask[i % 4]);
        cout<<"\n data: "<<data;
      }

      cout<<"\n **read done**\n\n";
    }
  }
   
}

void* listen_loop(void *ptr)
{
  cout<<"\n entering listen loop";

  //  socklen_t sockfd, newsockfd, portno, clilen;
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
  int optval = 1;
  setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, &optval, sizeof(optval));
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

    int key_len = strlen(ptr1)-strlen(ptr2)-strlen(keyhead)-1;

    char key[1000];
    strncpy(key, ptr1+strlen(keyhead), key_len);
    key[key_len-1] = '\0';
    cout<<"\nkey: "<<key;
    cout<<"[end key]";

    char guid[] = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    strcat(key, guid);

    cout<<"\ncatkey:"<<key;

    unsigned char hash[20];
    sha1::calc(key, strlen(key), hash);
    cout<<"\nhash : "<<hash;
 
    const string s(reinterpret_cast<char*>(hash));
    string keystr  = base64_encode(reinterpret_cast<const unsigned char*>(s.c_str()), s.length());
    
    string response = "HTTP/1.1 101 Switching Protocols\r\n";
    response.append("Upgrade: websocket\r\n");
    response.append("Connection: Upgrade\r\n");
    response.append("Sec-WebSocket-Accept: " + keystr + "\r\n\r\n");

    cout<<"\n\nresponse:\n"<<response;

    n = write(newsockfd,response.c_str(),response.length());
    if (n < 0) {
      cout<<"\nERROR writing to socket";
      return(0);
    }

    //cout<<"\n about to sleep";
    //sleep(3);
    //cout<<"\n awake - about to send";
    //char hello[] = "hello";
    //send(newsockfd, hello, strlen(hello), 0);
    //cout<<"\n send completed";
    //sleep(3);
  }

  return 0; 
}

void* close_socks_loop(void *ptr)
{
  cout<<"\n entering close_socks loop";
  bool run = true;
  while(run){
    if(g_force_exit){
      shutdown(newsockfd, 2);
      close(newsockfd);
      shutdown(sockfd, 2);
      close(sockfd);
      run = false;
    }
  }
  cout<<"\n closed sockets. leaving close_socks_loop";
  exit(0);
}
