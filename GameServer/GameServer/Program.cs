using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Fleck;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GameServer
{
    internal class Game
    {
        public string GameId;
        public List<Team> Teams = new List<Team>();

        public void HandleMessage(Dictionary<string, object> msg, IWebSocketConnection socket)
        {
            var team = Teams.SingleOrDefault(x => x.TeamId == msg["teamid"].ToString());
            if (team == null)
            {
                Teams.Add(new Team(socket)
                {
                    TeamId = msg["teamid"].ToString()
                });
            }
            else
            {
                team.HandleMessage(msg);
            }
        }
    }

    internal class Team
    {
        public string TeamId;
        public List<Tank> Tanks = new List<Tank>();
        public IWebSocketConnection Socket;

        public Team(IWebSocketConnection socket)
        {
            Socket = socket;
        }

        public void HandleMessage(Dictionary<string, object> msg)
        {
            var tank = Tanks.SingleOrDefault(x => x.TankId == msg["tankid"].ToString());
            if (tank == null)
            {
                Tanks.Add(new Tank()
                {
                    TankId = msg["tankid"].ToString(),
                    LookPoint = new Point(JsonConvert.DeserializeObject <Dictionary<string, object>>(msg["lookpt"].ToString())),
                    LookAngle = float.Parse(msg["lookangle"].ToString()),
                    Loc = new Point(JsonConvert.DeserializeObject <Dictionary<string, object>>(msg["loc"].ToString())),
                    Firing = bool.Parse(msg["firing"].ToString()),
                    Health = Int32.Parse(msg["health"].ToString()),
                    Alive = bool.Parse(msg["alive"].ToString())
                });
            }
            else
            {
                tank.LookPoint = new Point(JsonConvert.DeserializeObject<Dictionary<string, object>>(msg["lookpt"].ToString()));
                tank.LookAngle = float.Parse(msg["lookangle"].ToString());
                tank.Loc = new Point(JsonConvert.DeserializeObject<Dictionary<string, object>>(msg["loc"].ToString()));
                tank.Firing = bool.Parse(msg["firing"].ToString());
                tank.Health = Int32.Parse(msg["health"].ToString());
                tank.Alive = bool.Parse(msg["alive"].ToString());
            }            
        }
    }

    internal class Tank
    {
        public string TankId;
        public Point LookPoint;
        public float LookAngle;
        public Point Loc;
        public bool Firing;
        public int Health;
        public bool Alive;
    }

    internal class Point
    {
        public float X;
        public float Y;

        public Point(Dictionary<string, Object> obj )
        {
            X = float.Parse(obj["x"].ToString());
            Y = float.Parse(obj["y"].ToString());
        }
    }

    class Notifier
    {
        public void NotifyTeams()
        {
            while (!ShouldStop)
            {
                lock (_games)
                {
                    foreach (var game in _games)
                    {
                        foreach (var team in game.Teams)
                        {
                            var otherTeams = game.Teams.Where(x => x.TeamId != team.TeamId).ToList();
                            if (otherTeams.Count > 0)
                            {
                                foreach (var otherTeam in otherTeams)
                                {
                                    byte[] otherTeamInfo =
                                        Encoding.ASCII.GetBytes(JsonConvert.SerializeObject(otherTeam.Tanks));
                                    team.Socket.Send(otherTeamInfo);
                                }
                            }
                            
                        }
                    }
                }

                Thread.Sleep(200);
            }
        }

        private static List<Game> _games;
        private static WebSocketServer _server; 

        public bool ShouldStop = false;

        public Notifier(List<Game> games, WebSocketServer server)
        {
            _games = games;
            _server = server;
        }

    }

    class Program
    {
        public static List<Game> Games = new List<Game>();

        public static Thread NotifyTeamsThread;

        static WebSocketServer _server = new WebSocketServer("ws://0.0.0.0:8181");
        
        public static Notifier _Notifier;

        static void Main(string[] args)
        { 
            _server = new WebSocketServer("ws://0.0.0.0:8181");
            _server.Start(socket =>
            {
                socket.OnOpen = () => Console.WriteLine("Open!");
                socket.OnClose = () => Console.WriteLine("Close!");
                socket.OnMessage = message => HandleGameMessage(message, socket);
            });

            _Notifier = new Notifier(Games, _server);
            NotifyTeamsThread = new Thread(_Notifier.NotifyTeams);
            NotifyTeamsThread.Start();
            Console.ReadKey();

            _Notifier.ShouldStop = true;
        }

        public static void HandleGameMessage(string json, Fleck.IWebSocketConnection socket)
        {
            lock (Games)
            {
                var message = JsonConvert.DeserializeObject<Dictionary<string, object>>(json);
                var game = Games.SingleOrDefault(x => x.GameId == message["gameid"].ToString());
                if (game == null)
                {
                    //create new game
                    Games.Add(new Game()
                    {
                        GameId = message["gameid"].ToString()
                    });
                }
                else
                {
                    //handle the message in the correct game
                    game.HandleMessage(message, socket);
                }
            }
        }

        private class GameId
        {

        }
    }
}
