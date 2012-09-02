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
#include <assert.h>
//for hex to int and stringstream
#include <iomanip>
#include <sstream>

using namespace std;
socklen_t sockfd, newsockfd, portno, clilen;
bool g_force_exit = false;

#define MAX_SOCKETS 25

class socketlist
{
private:
  socklen_t list[MAX_SOCKETS];
  int num_sockets;
public:
  void addsocket(socklen_t newsocket){
    if(num_sockets==MAX_SOCKETS)
      g_force_exit = true;

    list[num_sockets]=newsocket;
    num_sockets++;
  }
  
  int size(){
    return num_sockets;
  }

  socklen_t getsock(int item){
    return list[item];
  }

  void removesocket(socklen_t newsocket){
    cout<<"\n implement me list.removesocket()";
    assert(0);
  }

  socketlist():num_sockets(0){}

}g_socketlist;



class msg
{
public:
  string msgstr;
  int teamid;
  int playerid;
  int x;
  int y;
  int lx;
  int ly;

  void print() {
    cout<<"\nprinting msg";
    cout<<"\nteamid: "<<teamid;
    cout<<"\nplayerid: "<<playerid;
    cout<<"\nx: "<<x;
    cout<<"\ny: "<<y;
    cout<<"\nlx: "<<lx;
    cout<<"\nly: "<<ly;
    cout<<"\n\n";
  }
};

void socksend(socklen_t sock, string buffer)
{
  char cb[120];
  sprintf(cb, "%c", 129);
  if(buffer.length()>1 && buffer.length()<118) 
    sprintf(cb+1, "%c", (int)buffer.length());
  else {
    cout<<"\n buffer too small/big: "<<buffer;
    assert(0);
  }
  cb[2]='\0';
  //cb[0]='a';
  //cb[1]='b';
  //cb[2]='\0';
  strncat(cb,buffer.c_str(),buffer.length());
  //  cb[2]='\0';
  //cout<<"\n cb: "<<cb;
  //std::stringstream hexbuf;
  /*
  hexbuf<<"0x"<<hex<<129<<"0x"<<hex<<buffer.length()<<buffer;
  cout<<"\n hexbuf: "<<hexbuf;
  string sb (hexbuf.str());
  cout<<"\n attempting socksend to :"<<sock;
  */
 
  //send(sock,cb , 3, 0);
  cout<<"\n socksendstr: "<<cb<<" length:"<<strlen(cb)<<"\n"; 
  send(sock, cb, strlen(cb),0);
}

#define MAX_GAME_SOCKETS 5
class game
{
private:
  //each game has 2 sockets
  socklen_t _sockets[MAX_GAME_SOCKETS];
  string _gameid;
  int _num_socks; 
public:
  string id(){ return _gameid; }

  game(string gameid):_gameid(gameid),_num_socks(0) {}
  void addsocket(socklen_t sock) { 
    if(_num_socks==MAX_GAME_SOCKETS) {
      cout<<"\n game is full";
      return;
    }
    _sockets[_num_socks]= sock; 
    _num_socks++; 
  }

  bool isnewsocket(socklen_t sock)
  {
    for(int i=0; i<_num_socks; i++){
      if(_sockets[i]==sock)
	return false;
    }
    return true;
  }

  //this is crude, we should not send to the sender!!
  void sendmsg(msg* m, socklen_t sendersock){
    //new socket, add it to sock list
    if(isnewsocket(sendersock)){
      addsocket(sendersock);
      cout<<"\nadded team: "<<m->teamid<<" to game: "<<_gameid;
    }
    
    //send msg to the other socks
    cout<<"\nsendersock: "<<sendersock;
    for(int i=0; i<_num_socks; i++){
      if(_sockets[i]!=sendersock){
	//write to the sockets
	socksend(_sockets[i], m->msgstr);
      }	
    }
  }
};

#define MAX_GAMES 5
class gamelist
{
private:
  game *_list[MAX_GAMES];
  int _num_games;

public:
  int size() { return _num_games; }

  game* getgame(int pos) { 
    assert(_num_games>pos);
    return _list[pos]; 
  }

  game* addgame(string gameid){
    if(_num_games==MAX_GAMES)
      return NULL;
    
    cout<<"\ncreateing new game with id: "<<gameid;
    cout<<"\n\n";
    game* newgame = new game(gameid);
    _list[_num_games] = newgame;
    _num_games++;
    return newgame;
  }

  bool isnwgame(string gameid){
    for(int i=0; i<_num_games; i++){
      if(_list[i]->id() == gameid){
	return false;
      }	
    }
    return true;
  }

  game* findgame(string gameid){
    for(int i=0; i<_num_games; i++){
      if(_list[i]->id()==gameid)
	return _list[i];
    }
    return NULL;
  }

}g_gamelist;

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

void send_msg()
{
  cout<<"\n force send payload \n\n";
  int len = 10;
  char buffer[len];
  buffer[0] = 0x81; //fin + opcode 1 (text frame)
  buffer[1] = 0x02; //Mask 0 + payload size
  strncpy(&buffer[2], "aa", 2); //0x32 is 50 ascii = number 2
  buffer[4]='\0';
  
  send(g_socketlist.getsock(0), buffer, strlen(buffer), 0);
}


void* read_keyboard_loop(void *ptr)
{
  cout<<"\n entering read keyb loop";
  string input = "empty";
  string exit = "exit";
  string send = "send";
  while(input!=exit){
    cin>>input;
    if(input==send)
      send_msg(); 
  }
  g_force_exit = true;
  cout<<"\n exiting read_keyboard_loop! enter to complete";
  cin>>input;
}

void handlemessage(string str, socklen_t sock)
{
  //cout<<"\nmsg: "<<str;
  msg *m = new msg();
  m->msgstr = str;
  int pos = str.find_first_of(" ");
  int count = 0;
  string gameid;
  while(pos>0){
    //cout<<"\npos: "<<pos;
    //cout<<"  var: "<<str.substr(0, pos);
    str = str.substr(pos+1);
    int num = atoi(str.c_str());
    switch(count){
    case 0: gameid = num; break;
    case 1: m->teamid = num; break;
    case 2: m->playerid = num; break;
    case 3: m->x = num; break;
    case 4: m->y = num; break;
    case 5: m->lx = num; break;
    case 6: m->ly = num; break;
    default: assert(0);
    }
    //cout<<"\nhere";
    count++;
    //cout<<"\nstr: "<<str;
    pos = str.find_first_of(" ");
    //cout<<"\npos: "<<pos;
  }

  //find the game in the list, corr to this msg
  game* fgame = g_gamelist.findgame(gameid);

  //if it does not exist, make a new one
  if(!fgame)
    fgame = g_gamelist.addgame(gameid);

  assert(fgame);
  //activate send msg to all the other game sox
  fgame->sendmsg(m, sock);
  cout<<"\n sending msg to peers";

  

  m->print();
  //cout<<"\n\n";
}

void* recv_loop(void *ptr)
{
  cout<<"\n entering recv_loop";
  
  while(!g_force_exit){
    
    for(int i=0; i<g_socketlist.size();i++){
      socklen_t sock = g_socketlist.getsock(i); 
      char rb[10];
      
      //byte 0 -> fin, opcode
      recv(sock, rb, 1, 0);
      bool fin = (bool)(*rb & 0x80);
      //cout<<"\n fin: "<<fin;
     
      char opcode = *rb & 0x0F;
      
      if(opcode == 0x01){
        //cout<<"\n opcode: text frame";
      }else if(opcode == 0x08){
        //cout<<"\n opcode: connection close";
	continue;
      } else {
        //cout<<"\n opcode: not handled";
	continue;
      }

      if(!fin || !opcode)
	continue;

      //byte 1 -> ismask, payload len
      recv(sock, rb, 1, 0);
      int length = *rb & 0x7F;
      if(length<1 || length>120)
	continue;

      //byte 2-9 -> check 2-7 for extended payload
      //recv(newsockfd, rb, 8, 0);

      //byte 10-13 -> masking
      char mask[4];
      for(int i=0; i<4;i++){
	recv(sock, rb, 1, 0);
	mask[i] = *rb;
      }
 
      if(!strlen(mask))
	continue;

      //cout<<"\n mask: "<<mask;

      //byte 14 - all -> payload 
      int data;
      char str[100];
      for (int i = 0; i < length; i++) {
        recv(sock, rb, 1, 0);
	//cout<<"\n payload rb: "<<(*rb^mask[i%4]);
        data = (*rb ^ mask[i % 4]);
	//cout<<"\n data: "<<data;
	str[i]=(char)data;
	//sprintf(str,"%d",data);
      }
      str[length]='\0';
      if(!strlen(str))
	continue;
      cout<<"\n recv: "<<str;
      
      handlemessage(str, sock);
      //cout<<"\n read complete\n\n";
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
  timeval tval;
  tval.tv_sec = 0;
  tval.tv_usec = 100; //this introduces latency

  setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, &optval, sizeof(optval));
  setsockopt(sockfd, SOL_SOCKET, SO_RCVTIMEO, &tval, sizeof(tval));
  if (bind(sockfd, (struct sockaddr *) &serv_addr, sizeof(serv_addr)) < 0)
    {
      cout<<"\nERROR on binding";
      return(0);
    }

  /* Now start listening for the clients, here process will
   * go in sleep mode and will wait for the incoming connection
   */
  while(!g_force_exit) {
    listen(sockfd,5);

    clilen = sizeof(cli_addr);

    /* Accept actual connection from the client */
    newsockfd = accept(sockfd, (struct sockaddr *)&cli_addr, 
		       &clilen);

    if (newsockfd < 0) 
      {
	//cout<<"\nERROR on accept";
	continue;
      }

    /* If connection is established then start communicating */
    memset(buffer, 0, sizeof(buffer));
    n = read(newsockfd,buffer,sizeof(buffer));
    if (n < 0){
      //cout<<"\nERROR reading from socket";
      continue;
    }

    cout<<"\n Got Connection";

    if(strlen(buffer)==0) {
      cout<<"\n buffer empty";
      continue;
    }

    cout<<buffer;
    
    char keyhead[] ="Sec-WebSocket-Key: ";
    char *ptr1 = strstr(buffer,keyhead);
    
    char verhead[] = "Sec-WebSocket-Version: ";
    char* ptr2 = strstr(buffer, verhead);

    if(!ptr1 || !ptr2){
      cout<<"\n this is some crappy shit";
      continue;
    }

    int key_len = strlen(ptr1)-strlen(ptr2)-strlen(keyhead)-1;

    char key[1000] = "test";
    strncpy(key, ptr1+strlen(keyhead), key_len);
    key[key_len-1] = '\0';
    cout<<"\nkey: "<<key;
    cout<<"[end key]";

    char guid[] = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    strcat(key, guid);

    cout<<"\ncatkey:"<<key;

    unsigned char hash[24];
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

    g_socketlist.addsocket(newsockfd);

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
