# -*- coding: utf-8 -*-

##############
##### Python sever interacting with javascript client
##############

# See dyadic_interaction.js for a summary of the communication channel - we are using
# json-encoded dictionaries to send messages back and forth between server and client.

# Each message from the server to the client includes a key command_type which
# lets the client know what action to take.

# Each message from the client to the server includes a key response_type, which
# indicates the kind of response the client is providing.


##############
##### Libraries
##############

# NB this loads the code from the websocket_server folder, which needs to be in the
# same directory as this file.
from websocket_server import WebsocketServer
import random
import json
import csv
from copy import deepcopy
import time

#assuming a ping every 5 seconds
max_timediff_before_timeout = 1600

######################
##### Globals to manage experiment progress
######################

# We use several global variables to keep track of important information on
# connected clients, which stage of the experiment they are at etc - then when
# we receive a response from a client we can consult this information to see
# where they are in the experiment and what they should do next.

# The main global variable is a dictionary, global_participant_data
# Each connected client has an entry in here, indexed by their ID (an integer assigned
# when they connect). Stored alongside their entry is all the information we need to guide
# them through the experiment, including their client_info (details of the socket etc
# that is required for message passing), the ID of their partner, their current role (e.g.
# director or matcher), their list of trials, the trial counter showing where they are in
# the experiment.
# Keys are client_info, partner, role, trial_list, shared_trial_counter
global_participant_data = {}

# for each condition name, a list of client IDs for clients who are in the waiting room waiting to be paired
# would be better!
unpaired_clients = {'condition1':[],
                    'condition2':[]}

# this controls who gets paired with who - in this case, opposites
pair_with = {'condition1':'condition2','condition2':'condition1'}

# The list of phases in the experiment - clients progress through this list
# ***NB phases have to be uniquely named***, because we use index() to identify
# where in the experiment the client is.
phase_sequence = ['Start','PairParticipants','Interaction','End']

# In this experiment the director is prompted with a context image + context sentence + target image,
# and asked to provide a label for the target image, selecting from a list of options. This label passed to the matcher. 
# The matcher then guess what the target image was, drawing from a list of options. 
# This means for each trial we need to specify:
# context image, 
# target image
# context sentence
# label choices for the director
# image choices for the matcher
#
# Each item in trial_list specifies these parameters, using a python dictionary that is hopefully easy to read.
# The trial list below gives 2 trials, which will be presented in random order; to make the list longer I am 
# presenting them both 5 times, which will be useful for testing, which is what the *5 at the end does
# ...existing code...
trial_list = [
    # supportive trials
    {
        'context_image':'artist_run',
        'context_sentence':'Riko pilka',
        'target_image':'artist_sing',
        'director_choices':["somo", "somo pilka", "pilka", "pilka somo"],
        'matcher_choices':["artist_run", "pirate_run", "artist_sing", "pirate_sing"],
        'whole_image_d':'301',
        'whole_image_m':'401'
    },
    {
        'context_image':'artist_jump',
        'context_sentence':'Jato pilka',
        'target_image':'artist_sing',
        'director_choices':["somo", "somo pilka", "pilka", "pilka somo"],
        'matcher_choices':["artist_jump", "pirate_jump", "artist_sing", "pirate_sing"],
        'whole_image_d':'302',
        'whole_image_m':'402'
    },
    {
        'context_image':'artist_sleep',
        'context_sentence':'Leno pilka',
        'target_image':'artist_sing',
        'director_choices':["somo", "somo pilka", "pilka", "pilka somo"],
        'matcher_choices':["artist_sleep", "pirate_sleep", "artist_sing", "pirate_sing"],
        'whole_image_d':'303',
        'whole_image_m':'403'
    },
    {
        'context_image':'artist_sing',
        'context_sentence':'Somo pilka',
        'target_image':'artist_run',
        'director_choices':["riko", "riko pilka", "pilka", "pilka riko"],
        'matcher_choices':["artist_sing", "pirate_sing", "artist_run", "pirate_run"],
        'whole_image_d':'304',
        'whole_image_m':'404'
    },
    {
        'context_image':'artist_jump',
        'context_sentence':'Jato pilka',
        'target_image':'artist_run',
        'director_choices':["riko", "riko pilka", "pilka", "pilka riko"],
        'matcher_choices':["artist_jump", "pirate_jump", "artist_run", "pirate_run"],
        'whole_image_d':'305',
        'whole_image_m':'405'
    },
    {
        'context_image':'artist_sleep',
        'context_sentence':'Leno pilka',
        'target_image':'artist_run',
        'director_choices':["riko", "riko pilka", "pilka", "pilka riko"],
        'matcher_choices':["artist_sleep", "pirate_sleep", "artist_run", "pirate_run"],
        'whole_image_d':'306',
        'whole_image_m':'406'
    },
    {
        'context_image':'artist_sing',
        'context_sentence':'Somo pilka',
        'target_image':'artist_jump',
        'director_choices':["jato", "jato pilka", "pilka", "pilka jato"],
        'matcher_choices':["artist_sing", "pirate_sing", "artist_jump", "pirate_jump"],
        'whole_image_d':'307',
        'whole_image_m':'407'
    },
    {
        'context_image':'artist_run',
        'context_sentence':'Riko pilka',
        'target_image':'artist_jump',
        'director_choices':["jato", "jato pilka", "pilka", "pilka jato"],
        'matcher_choices':["artist_run", "pirate_run", "artist_jump", "pirate_jump"],
        'whole_image_d':'308',
        'whole_image_m':'408'
    },
    {
        'context_image':'artist_sleep',
        'context_sentence':'Leno pilka',
        'target_image':'artist_jump',
        'director_choices':["jato", "jato pilka", "pilka", "pilka jato"],
        'matcher_choices':["artist_sleep", "pirate_sleep", "artist_jump", "pirate_jump"],
        'whole_image_d':'309',
        'whole_image_m':'409'
    },
    {
        'context_image':'artist_sing',
        'context_sentence':'Somo pilka',
        'target_image':'artist_sleep',
        'director_choices':["leno", "leno pilka", "pilka", "pilka leno"],
        'matcher_choices':["artist_sing", "pirate_sing", "artist_sleep", "pirate_sleep"],
        'whole_image_d':'310',
        'whole_image_m':'410'
    },
    {
        'context_image':'artist_run',
        'context_sentence':'Riko pilka',
        'target_image':'artist_sleep',
        'director_choices':["leno", "leno pilka", "pilka", "pilka leno"],
        'matcher_choices':["artist_run", "pirate_run", "artist_sleep", "pirate_sleep"],
        'whole_image_d':'311',
        'whole_image_m':'411'
    },
    {
        'context_image':'artist_jump',
        'context_sentence':'Jato pilka',
        'target_image':'artist_sleep',
        'director_choices':["leno", "leno pilka", "pilka", "pilka leno"],
        'matcher_choices':["artist_jump", "pirate_jump", "artist_sleep", "pirate_sleep"],
        'whole_image_d':'312',
        'whole_image_m':'412'
    },
    {
        'context_image':'pirate_run',
        'context_sentence':'Riko barsa',
        'target_image':'pirate_sing',
        'director_choices':["somo", "somo barsa", "barsa", "barsa somo"],
        'matcher_choices':["pirate_run", "artist_run", "pirate_sing", "artist_sing"],
        'whole_image_d':'313',
        'whole_image_m':'413'
    },
    {
        'context_image':'pirate_jump',
        'context_sentence':'Jato barsa',
        'target_image':'pirate_sing',
        'director_choices':["somo", "somo barsa", "barsa", "barsa somo"],
        'matcher_choices':["pirate_jump", "artist_jump", "pirate_sing", "artist_sing"],
        'whole_image_d':'314',
        'whole_image_m':'414'
    },
    {
        'context_image':'pirate_sleep',
        'context_sentence':'Leno barsa',
        'target_image':'pirate_sing',
        'director_choices':["somo", "somo barsa", "barsa", "barsa somo"],
        'matcher_choices':["pirate_sleep", "artist_sleep", "pirate_sing", "artist_sing"],
        'whole_image_d':'315',
        'whole_image_m':'415'
    },
    {
        'context_image':'pirate_sing',
        'context_sentence':'Somo barsa',
        'target_image':'pirate_run',
        'director_choices':["riko", "riko barsa", "barsa", "barsa riko"],
        'matcher_choices':["pirate_sing", "artist_sing", "pirate_run", "artist_run"],
        'whole_image_d':'316',
        'whole_image_m':'416'
    },
    {
        'context_image':'pirate_jump',
        'context_sentence':'Jato barsa',
        'target_image':'pirate_run',
        'director_choices':["riko", "riko barsa", "barsa", "barsa riko"],
        'matcher_choices':["pirate_jump", "artist_jump", "pirate_run", "artist_run"],
        'whole_image_d':'317',
        'whole_image_m':'417'
    },
    {
        'context_image':'pirate_sleep',
        'context_sentence':'Leno barsa',
        'target_image':'pirate_run',
        'director_choices':["riko", "riko barsa", "barsa", "barsa riko"],
        'matcher_choices':["pirate_sleep", "artist_sleep", "pirate_run", "artist_run"],
        'whole_image_d':'318',
        'whole_image_m':'418'
    },
    {
        'context_image':'pirate_sing',
        'context_sentence':'Somo barsa',
        'target_image':'pirate_jump',
        'director_choices':["jato", "jato barsa", "barsa", "barsa jato"],
        'matcher_choices':["pirate_sing", "artist_sing", "pirate_jump", "artist_jump"],
        'whole_image_d':'319',
        'whole_image_m':'419'
    },
    {
        'context_image':'pirate_run',
        'context_sentence':'Riko barsa',
        'target_image':'pirate_jump',
        'director_choices':["jato", "jato barsa", "barsa", "barsa jato"],
        'matcher_choices':["pirate_run", "artist_run", "pirate_jump", "artist_jump"],
        'whole_image_d':'320',
        'whole_image_m':'420'
    },
    {
        'context_image':'pirate_sleep',
        'context_sentence':'Leno barsa',
        'target_image':'pirate_jump',
        'director_choices':["jato", "jato barsa", "barsa", "barsa jato"],
        'matcher_choices':["pirate_sleep", "artist_sleep", "pirate_jump", "artist_jump"],
        'whole_image_d':'321',
        'whole_image_m':'421'
    },
    {
        'context_image':'pirate_sing',
        'context_sentence':'Somo barsa',
        'target_image':'pirate_sleep',
        'director_choices':["leno", "leno barsa", "barsa", "barsa leno"],
        'matcher_choices':["pirate_sing", "artist_sing", "pirate_sleep", "artist_sleep"],
        'whole_image_d':'322',
        'whole_image_m':'422'
    },
    {
        'context_image':'pirate_run',
        'context_sentence':'Riko barsa',
        'target_image':'pirate_sleep',
        'director_choices':["leno", "leno barsa", "barsa", "barsa leno"],
        'matcher_choices':["pirate_run", "artist_run", "pirate_sleep", "artist_sleep"],
        'whole_image_d':'323',
        'whole_image_m':'423'
    },
    {
        'context_image':'pirate_jump',
        'context_sentence':'Jato barsa',
        'target_image':'pirate_sleep',
        'director_choices':["leno", "leno barsa", "barsa", "barsa leno"],
        'matcher_choices':["pirate_jump", "artist_jump", "pirate_sleep", "artist_sleep"],
        'whole_image_d':'324',
        'whole_image_m':'424'
    },
    # non-supportive context
    {
        "context_image": "pirate_run",
        "context_sentence": "Riko barsa",
        "target_image": "artist_sing",
        "director_choices": ["somo", "somo pilka", "pilka", "pilka somo"],
        "matcher_choices": ["pirate_run", "artist_run", "pirate_sing", "artist_sing"],
        "whole_image_d": "325",
        "whole_image_m": "425"
    },
    {
        "context_image": "pirate_jump",
        "context_sentence": "Jato barsa",
        "target_image": "artist_sing",
        "director_choices": ["somo", "somo pilka", "pilka", "pilka somo"],
        "matcher_choices": ["pirate_jump", "artist_jump", "pirate_sing", "artist_sing"],
        "whole_image_d": "326",
        "whole_image_m": "426"
    },
    {
        "context_image": "pirate_sleep",
        "context_sentence": "Leno barsa",
        "target_image": "artist_sing",
        "director_choices": ["somo", "somo pilka", "pilka", "pilka somo"],
        "matcher_choices": ["pirate_sleep", "artist_sleep", "pirate_sing", "artist_sing"],
        "whole_image_d": "327",
        "whole_image_m": "427"
    },
    {
        "context_image": "pirate_sing",
        "context_sentence": "Somo barsa",
        "target_image": "artist_run",
        "director_choices": ["riko", "riko pilka", "pilka", "pilka riko"],
        "matcher_choices": ["pirate_sing", "artist_sing", "pirate_run", "artist_run"],
        "whole_image_d": "328",
        "whole_image_m": "428"
    },
    {
        "context_image": "pirate_jump",
        "context_sentence": "Jato barsa",
        "target_image": "artist_run",
        "director_choices": ["riko", "riko pilka", "pilka", "pilka riko"],
        "matcher_choices": ["pirate_jump", "artist_jump", "pirate_run", "artist_run"],
        "whole_image_d": "329",
        "whole_image_m": "429"
    },
    {
        "context_image": "pirate_sleep",
        "context_sentence": "Leno barsa",
        "target_image": "artist_run",
        "director_choices": ["riko", "riko pilka", "pilka", "pilka riko"],
        "matcher_choices": ["pirate_sleep", "artist_sleep", "pirate_run", "artist_run"],
        "whole_image_d": "330",
        "whole_image_m": "430"
    },
    {
        "context_image": "pirate_sing",
        "context_sentence": "Somo barsa",
        "target_image": "artist_jump",
        "director_choices": ["jato", "jato pilka", "pilka", "pilka jato"],
        "matcher_choices": ["pirate_sing", "artist_sing", "pirate_jump", "artist_jump"],
        "whole_image_d": "331",
        "whole_image_m": "431"
    },
    {
        "context_image": "pirate_run",
        "context_sentence": "Riko barsa",
        "target_image": "artist_jump",
        "director_choices": ["jato", "jato pilka", "pilka", "pilka jato"],
        "matcher_choices": ["pirate_run", "artist_run", "pirate_jump", "artist_jump"],
        "whole_image_d": "332",
        "whole_image_m": "432"
    },
    {
        "context_image": "pirate_sleep",
        "context_sentence": "Leno barsa",
        "target_image": "artist_jump",
        "director_choices": ["jato", "jato pilka", "pilka", "pilka jato"],
        "matcher_choices": ["pirate_sleep", "artist_sleep", "pirate_jump", "artist_jump"],
        "whole_image_d": "333",
        "whole_image_m": "433"
    },
    {
        "context_image": "pirate_sing",
        "context_sentence": "Somo barsa",
        "target_image": "artist_sleep",
        "director_choices": ["leno", "leno pilka", "pilka", "pilka leno"],
        "matcher_choices": ["pirate_sing", "artist_sing", "pirate_sleep", "artist_sleep"],
        "whole_image_d": "334",
        "whole_image_m": "434"
    },
    {
        "context_image": "pirate_run",
        "context_sentence": "Riko barsa",
        "target_image": "artist_sleep",
        "director_choices": ["leno", "leno pilka", "pilka", "pilka leno"],
        "matcher_choices": ["pirate_run", "artist_run", "pirate_sleep", "artist_sleep"],
        "whole_image_d": "335",
        "whole_image_m": "435"
    },
    {
        "context_image": "pirate_jump",
        "context_sentence": "Jato barsa",
        "target_image": "artist_sleep",
        "director_choices": ["leno", "leno pilka", "pilka", "pilka leno"],
        "matcher_choices": ["pirate_jump", "artist_jump", "pirate_sleep", "artist_sleep"],
        "whole_image_d": "336",
        "whole_image_m": "436"
    },
    {
        "context_image": "artist_run",
        "context_sentence": "Riko pilka",
        "target_image": "pirate_sing",
        "director_choices": ["somo", "somo barsa", "barsa", "barsa somo"],
        "matcher_choices": ["artist_run", "pirate_run", "artist_sing", "pirate_sing"],
        "whole_image_d": "337",
        "whole_image_m": "437"
    },
    {
        "context_image": "artist_jump",
        "context_sentence": "Jato pilka",
        "target_image": "pirate_sing",
        "director_choices": ["somo", "somo barsa", "barsa", "barsa somo"],
        "matcher_choices": ["artist_jump", "pirate_jump", "artist_sing", "pirate_sing"],
        "whole_image_d": "338",
        "whole_image_m": "438"
    },
    {
        "context_image": "artist_sleep",
        "context_sentence": "Leno pilka",
        "target_image": "pirate_sing",
        "director_choices": ["somo", "somo barsa", "barsa", "barsa somo"],
        "matcher_choices": ["artist_sleep", "pirate_sleep", "artist_sing", "pirate_sing"],
        "whole_image_d": "339",
        "whole_image_m": "439"
    },
    {
        "context_image": "artist_sing",
        "context_sentence": "Somo pilka",
        "target_image": "pirate_run",
        "director_choices": ["riko", "riko barsa", "barsa", "barsa riko"],
        "matcher_choices": ["artist_sing", "pirate_sing", "artist_run", "pirate_run"],
        "whole_image_d": "340",
        "whole_image_m": "440"
    },
    {
        "context_image": "artist_jump",
        "context_sentence": "Jato pilka",
        "target_image": "pirate_run",
        "director_choices": ["riko", "riko barsa", "barsa", "barsa riko"],
        "matcher_choices": ["artist_jump", "pirate_jump", "artist_run", "pirate_run"],
        "whole_image_d": "341",
        "whole_image_m": "441"
    },
    {
        "context_image": "artist_sleep",
        "context_sentence": "Leno pilka",
        "target_image": "pirate_run",
        "director_choices": ["riko", "riko barsa", "barsa", "barsa riko"],
        "matcher_choices": ["artist_sleep", "pirate_sleep", "artist_run", "pirate_run"],
        "whole_image_d": "342",
        "whole_image_m": "442"
    },
    {
        "context_image": "artist_sing",
        "context_sentence": "Somo pilka",
        "target_image": "pirate_jump",
        "director_choices": ["jato", "jato barsa", "barsa", "barsa jato"],
        "matcher_choices": ["artist_sing", "pirate_sing", "artist_jump", "pirate_jump"],
        "whole_image_d": "343",
        "whole_image_m": "443"
    },
    {
        "context_image": "artist_run",
        "context_sentence": "Riko pilka",
        "target_image": "pirate_jump",
        "director_choices": ["jato", "jato barsa", "barsa", "barsa jato"],
        "matcher_choices": ["artist_run", "pirate_run", "artist_jump", "pirate_jump"],
        "whole_image_d": "344",
        "whole_image_m": "444"
    },
    {
        "context_image": "artist_sleep",
        "context_sentence": "Leno pilka",
        "target_image": "pirate_jump",
        "director_choices": ["jato", "jato barsa", "barsa", "barsa jato"],
        "matcher_choices": ["artist_sleep", "pirate_sleep", "artist_jump", "pirate_jump"],
        "whole_image_d": "345",
        "whole_image_m": "445"
    },
    {
        "context_image": "artist_sing",
        "context_sentence": "Somo pilka",
        "target_image": "pirate_sleep",
        "director_choices": ["leno", "leno barsa", "barsa", "barsa leno"],
        "matcher_choices": ["artist_sing", "pirate_sing", "artist_sleep", "pirate_sleep"],
        "whole_image_d": "346",
        "whole_image_m": "446"
    },
    {
        "context_image": "artist_run",
        "context_sentence": "Riko pilka",
        "target_image": "pirate_sleep",
        "director_choices": ["leno", "leno barsa", "barsa", "barsa leno"],
        "matcher_choices": ["artist_run", "pirate_run", "artist_sleep", "pirate_sleep"],
        "whole_image_d": "347",
        "whole_image_m": "447"
    },
    {
        "context_image": "artist_jump",
        "context_sentence": "Jato pilka",
        "target_image": "pirate_sleep",
        "director_choices": ["leno", "leno barsa", "barsa", "barsa leno"],
        "matcher_choices": ["artist_jump", "pirate_jump", "artist_sleep", "pirate_sleep"],
        "whole_image_d": "348",
        "whole_image_m": "448"
    },
]

##############
##### Utility functions
##############

# Returns randomised copy of l, i.e. does not shuffle in place
def shuffle(l):
    return random.sample(l, len(l))

# Converts message string to JSON string and sends to client_id.
# See below for explanation of how client_id indexes into global_participant_data
def send_message_by_id(client_id,message):
    client = global_participant_data[client_id]['client_info']
    print("sending",client_id,message)
    print("last heard from",global_participant_data[client_id]['lastHeardFrom'])
    if time.time()-global_participant_data[client_id]['lastHeardFrom']>max_timediff_before_timeout:
        print('not heard from, disconnecting')
        client_left(client,server)
    else:
        print('sending')
        server.send_message(client,json.dumps(message))

# Checks that all clients listed in list_of_ids are still connected to the server -
# if so, clients will be in global_participant_data
def all_connected(list_of_ids):
    connected_status = [id in global_participant_data for id in list_of_ids]
    if sum(connected_status)==len(list_of_ids):
        return True
    else:
        return False

# Called when a client drops out, used to notify any clients who are still connected
# that this leaves them stranded.
def notify_stranded(list_of_ids):
    for id in list_of_ids:
        if id in global_participant_data:
            #this will notify the participant and cause them to disconnect
            send_message_by_id(id,{"command_type":"PartnerDropout"})



######################
##### Handling clients connecting, disconnecting, sending messages
######################

# Called for every client connecting (after handshake)
# Initialiases that client in global_participant_data, then sends them to the
# "Start" phase of the experiment
# client objects passed over from the websocket are dictionaries including an id
# key (the client's integer identifier) and a client_info key, which contains
# technical details needed to communicate with this client via the socket
def new_client(client, server):
    client_id = client['id']
    print("New client connected and was given id %d" % client_id)
    global_participant_data[client_id] = {'client_info':client,'lastHeardFrom':time.time()}
    #give them the instructions for the first phase
    enter_phase(client_id,"Start")


# Called for every client disconnecting
# Finds all partners and notifies (NB this will have no effect if experiment is over)
# Remove the client from unpaired_clients if appropriate
# Remove the client from global_participant_data
def client_left(client, server):
    client_id = client['id']
    print("Client(%d) disconnected" % client['id'])
    # If they are in the waiting room, remove
    if 'training_condition' in global_participant_data[client_id].keys():
        client_condition = global_participant_data[client_id]['training_condition']
        if client_id in unpaired_clients[client_condition]:
            unpaired_clients[client_condition].remove(client_id)
    # If they have a partner, and if you are not leaving because you are at the End state,
    # notify partner that they have been stranded
    if 'partner' in global_participant_data[client_id]:
        if global_participant_data[client_id]['phase']!='End':
            partner = global_participant_data[client_id]['partner']
            notify_stranded([partner])
    del global_participant_data[client_id]

#ping all clients in list
def ping_all(list_of_ids):
	for client_id in list_of_ids:
		send_message_by_id(client_id,{"command_type":"Ping"})


# Called when the server receives a message from the client.
# Simply parses the message to a dictionaruy using json.loads, reads off
# the response_type, and passes to handle_client_response
def message_received(client, server, message):
    #update last heard from
    global_participant_data[client_id]['lastHeardFrom']=time.time()
    print("Client(%d) said: %s" % (client['id'], message))
    #OK, now we have to handle the various possible responses
    response = json.loads(message)
    response_code =  response['response_type']
    handle_client_response(client['id'],response_code,response)


def message_received(client, server, message):
	client_id = client['id']
	print("Client(%d) said: %s" % (client_id, message))
	#OK, now we have to handle the various possible responses
	response = json.loads(message)
	response_code =  response['response_type']
	#if it's not just a ping or pong
	if response_code not in ["Pong"]:
		#if they have a partner, ping partner to check for problems
		if 'partner' in global_participant_data[client_id]:
			partner_id = global_participant_data[client_id]['partner']
			ping_all([partner_id]) #will hopefully detect closed sockets
	handle_client_response(client_id,response_code,response)


##########################
### Management of phases
##########################

# We use a list of named phases to manage client progression through the experiment -
# when one phase ends they move onto the next, which determines what messages they
# will receive from the server.
# ***NB phases have to be uniquely named***, because we are using index() to identify
# where in the experiment the client is.

# Simply looks up the client's current phase and moves them to the next phase
def progress_phase(client_id):
	current_phase = global_participant_data[client_id]['phase']
	current_phase_i = phase_sequence.index(current_phase)
	next_phase_i = current_phase_i+1
	next_phase = phase_sequence[next_phase_i]
	enter_phase(client_id,next_phase)

# enter_phase triggers actions associated with that phase.
# Start: immediately progress to the next phase
# PairParticipants: attempt to pair immediately with anyone in the waiting room,
# otherwise send to the waiting room
# Interaction: enter interaction trials
# End: send quit command
def enter_phase(client_id,phase):
    # Update the phase info for this client in the global dictionary
    global_participant_data[client_id]['phase']=phase

    # Nothing actually happens here, but in some experiments we will need to set stuff up
    # when the participant starts the experiment
    if phase=='Start':
        print('in start')
        #wait here until you receive a message from client detailing training condition, which will trigger progress
        None

    # Attempts to pair this client with anyone already in the waiting room
    elif phase=='PairParticipants':
        #send message to the client sending them to waiting room
        send_message_by_id(client_id,{"command_type":"WaitingRoom"})
        client_condition = global_participant_data[client_id]['training_condition']
        
        # If they can be immediately paired with someone in the appropriate condition, do so and progress to next phase
        condition_to_pair_with = pair_with[client_condition]

        if (len(unpaired_clients[condition_to_pair_with])>0): #If there is at least one person in the appropriate condition waiting
            unpaired_partner = unpaired_clients[condition_to_pair_with][0]
        
            #remove from unpaired list
            unpaired_clients[condition_to_pair_with].remove(unpaired_partner)
            
            # Link them - mark them as each others' partner in global_participant_data
            global_participant_data[client_id]['partner']=unpaired_partner
            global_participant_data[unpaired_partner]['partner']=client_id
            # Both participants will work through a shared target list, so store that info
            # with both clients, then move them to the next phase
            shuffled_targets = shuffle(trial_list)
            for c in [client_id,unpaired_partner]:
                global_participant_data[c]['trial_list'] = shuffled_targets
                global_participant_data[c]['shared_trial_counter'] = 0
                progress_phase(c)
        else: #otherwise add them to the appropriate unpaired_clients list
            unpaired_clients[client_condition].append(client_id) 



    # Once paired with a partner clients will end up here; Interaction phase starts with instructions,
    # so just send those instructions to the client
    elif phase=='Interaction':
        print('Initalising for interaction')
        send_instructions(client_id,phase)


    # When they hit the end phase, the EndExperiment command will instruct the clients to run the final test and then end the experiment.
    # Clients will disconnect as soon as they receive this, since they no longer need the connection
    elif phase=='End':
        send_message_by_id(client_id,{"command_type":"EndExperiment"})



#################
### Client loop, handling various client responses
#################

# For some responses, how we handle depends on client phase
# Response_code can be
# CLIENT_INFO: the client passing over some info, a unique identifier and info on training condition
# INTERACTION_INSTRUCTIONS_COMPLETE: client has finished reading the pre-interaction instructions
# RESPONSE: if the client is in the Director role, this means they have produced a label which
# can now be passed to the matcher. If the client is the Matcher, they have made their selection based
# on the clue provided by the director.
# FINISHED_FEEDBACK: the client has finished looking at the feedback screen indicating their
# success in the interaction.
# NONRESPONSIVE_PARTNER: the client is indicating that their partner has become non-responsive (NB this is
# not implemented in the client)

def handle_client_response(client_id,response_code,full_response):
    print('handle_client_response',client_id,response_code,full_response)
    # if client sends Ping, respond with Pong
    if response_code=='Ping':
        send_message_by_id(client_id,{"command_type":"Pong"})
    # client is passing in a unique ID and info on trainign condition, simply associate that with this client
    if response_code=='CLIENT_INFO':
        print("here")
        global_participant_data[client_id]['participantID']=full_response['client_info']
        global_participant_data[client_id]['training_condition']=full_response['training_condition']
        progress_phase(client_id)

    #interaction, instructions complete, can initiate actual interaction
    elif response_code=='INTERACTION_INSTRUCTIONS_COMPLETE':
        initiate_interaction(client_id)

    #response returned from director or matcher respectively
    elif response_code=='RESPONSE' and full_response['role']=='Director':
        handle_director_response(client_id,full_response)
    elif response_code=='RESPONSE' and full_response['role']=='Matcher':
        handle_matcher_response(client_id,full_response)

    #interaction feedback complete, next trial please
    elif response_code=='FINISHED_FEEDBACK':
        swap_roles_and_progress(client_id)

    #client reporting a non-responsive partner
    elif response_code=='NONRESPONSIVE_PARTNER':
        pass #not doing anything special with this - the participant reporting
		#the problem leaves, so for their partner it will be as if they have
		#dropped out



#################
### Interaction, handles trial progression etc
#################

# Runs when participants complete instructions.
# Need to waits until both participants are ready to progress - use the role key for this,
# mark participants as ReadyToInteract when they indicate they have finished reading the instructions.
# Then when both participants are ready we randomly assigns roles of Director and Matcher and
# start the first interaction trial.
def initiate_interaction(client_id):
    partner_id = global_participant_data[client_id]['partner']
    list_of_participants = [client_id,partner_id]
    #checking both players are still connected, to avoid one being left hanging
    if not(all_connected(list_of_participants)):
        notify_stranded(list_of_participants)
    else:
        send_message_by_id(client_id,{"command_type":"WaitForPartner"})
        partner_role = global_participant_data[partner_id]['role']
        #if your partnetr is ready to go, let's go!
        if partner_role=='ReadyToInteract':
            print('Starting interaction')
            #allocate random director and matcher, and run start_interaction_trial for both clients
            for client, role in zip(list_of_participants,shuffle(["Director", "Matcher"])):
                global_participant_data[client]['role'] = role
            start_interaction_trial(list_of_participants)
        else: #else mark you as ready to go, so you will wait for partner
            global_participant_data[client_id]['role']='ReadyToInteract'





# Interaction trial - sends director trial instruction to director and wait instruction to matcher
# For director, we need to send the D command_type, with the prompt_word and also the partner_id
# (the partner_id is just sent so that the client can record this in the data file it produces).
def start_interaction_trial(list_of_participants):
    #check everyone is still connected!
    if not(all_connected(list_of_participants)):
        notify_stranded(list_of_participants)
    else:
        #figure out who is the director
        director_id = [id for id in list_of_participants if global_participant_data[id]['role']=='Director'][0]
        #retrieve their trial list and trial counter
        trial_counter = global_participant_data[director_id]['shared_trial_counter']
        trial_list = global_participant_data[director_id]['trial_list']
        ntrials = len(trial_list)
        #check that the director has more trials to run - if not, move to next phase
        if trial_counter>=ntrials:
            for c in list_of_participants:
                progress_phase(c)
        else: #otherwise, if there are still trials to run
            #retrieve the info we need from global_participant_data
            matcher_id = global_participant_data[director_id]['partner']
            matcher_participant_id = global_participant_data[matcher_id]['participantID']
            for c in list_of_participants:
                this_role = global_participant_data[c]['role']
                if this_role=='Director': #send the appropriate instruction to the Director
                    instruction_string = {"command_type":"Director",
                                            "context_image":trial_list[trial_counter]['context_image'],
                                            "context_sentence":trial_list[trial_counter]['context_sentence'],
                                            "target_image": trial_list[trial_counter]['target_image'],
                                            "director_choices": trial_list[trial_counter]['director_choices'],
                                            "matcher_choices": trial_list[trial_counter]['matcher_choices'], #we send these so the director can include them in the response, which simplifies things when sending info to the matcher
                                            "partner_id":matcher_participant_id,
                                            "whole_image_d": trial_list[trial_counter]['whole_image_d'],
                                            "whole_image_m": trial_list[trial_counter]['whole_image_m'],}
                else: #and tell the matcher to wait
                    instruction_string = {"command_type":"WaitForPartner"}
                send_message_by_id(c,instruction_string)


# When director responds, all we need to do is relay the clue word to the matcher. Matcher needs
# command_type M, the prompt_word is the director's response value, and we also send over the
# matcher's array of options (hard-wired to object 4 and object 5) and the director's participant ID
#so the matcher can record this in their data file for us.
def handle_director_response(director_id,director_response):
    print('handle_director_response',director_response)
    matcher_id = global_participant_data[director_id]['partner']
    if not(all_connected([matcher_id])): #the usual check that everyone is still connected
        notify_stranded([director_id])
    else:
        #note that director_response['response'] is the sentence the director sent us
        #we also retrieve other crucial info from the director's response 
        director_participant_id=global_participant_data[director_id]['participantID']
        send_message_by_id(director_id,{"command_type":"WaitForPartner"})
        send_message_by_id(matcher_id,
                            {"command_type":"Matcher",
                                "context_image":director_response['context_image'],
                                "context_sentence":director_response['context_sentence'],
                                "target_image": director_response['target_image'],
                                "director_target_sentence":director_response['response'],
                                "matcher_choices": director_response['matcher_choices'],
                                "partner_id":director_participant_id,
                                "whole_image_d":director_response['whole_image_d'],
                                "whole_image_m":director_response['whole_image_m'],})

# When the matcher responds with their guess, we need to send feedback to matcher + director.
# The feedback could just be success/failure, or some more
# detailed info on exactly what the matcher got wrong
def handle_matcher_response(matcher_id,matcher_response):
    print("in handle_matcher_response")
    director_id = global_participant_data[matcher_id]['partner']
    if not(all_connected([director_id,matcher_id])):
        notify_stranded([director_id,matcher_id])
    else:
        #info on the target, the sentence the director provided, and the matcher's guess are included in the matcher's response
        target = matcher_response['target_image']
        director_response = matcher_response['director_target_sentence']
        matcher_guess = matcher_response['response']
        if target==matcher_guess:
            score=1
        else:
            score=0
        feedback = {"command_type":"Feedback","score":score}
        for c in [matcher_id,director_id]: #send to both clients
            send_message_by_id(c,feedback)



# Each client comes here when they signals they are done with feedback from an interaction trial.
# The first client who returns will set their role to 'WaitingToSwitch'.
# The second client to return will then trigger the next trial, then we can use the role of that
# second client to figure out who will be director and matcher at the next trial.
def swap_roles_and_progress(client_id):
    print('swap roles',client_id)
    partner_id = global_participant_data[client_id]['partner']
    if not(all_connected([client_id,partner_id])):
        notify_stranded([client_id,partner_id])
    else:
        #increment global counter - both participants will do this independently when they reach this point
        global_participant_data[client_id]['shared_trial_counter']+=1

        this_client_role = global_participant_data[client_id]['role']
        partner_role = global_participant_data[partner_id]['role']
        #If your partner is already ready, then switch roles and progress
        if partner_role=='WaitingToSwitch':
            if this_client_role=='Director': #if you were director for this trial then
                global_participant_data[client_id]['role'] = "Matcher" #next time you will be Matcher...
                global_participant_data[partner_id]['role'] = "Director" #..and your partner will be Director
            else:
                global_participant_data[client_id]['role'] = "Director" #otherwise the opposite
                global_participant_data[partner_id]['role'] = "Matcher"
            #next trial
            start_interaction_trial([client_id,partner_id])
        #Otherwise your partner is not yet ready, so just flag up that you are
        else:
            global_participant_data[client_id]['role'] = "WaitingToSwitch"



####################
### Instructions between blocks
####################

# Fairly simple, just send over a command_typ I message to the client, with instructon_type set to "Interaction"
def send_instructions(client_id,phase):
    if phase=='Interaction':
        #set role
        global_participant_data[client_id]['role'] = "ReadingInstructions"
        send_message_by_id(client_id,{"command_type":"Instructions","instruction_type":"Interaction"})

#######################
### Start up server
#######################

PORT=9009 #this will run on port 9009

#standard stuff here from the websocket_server code
print('starting up')
server = WebsocketServer(PORT,'0.0.0.0')
server.set_fn_new_client(new_client)
server.set_fn_client_left(client_left)
server.set_fn_message_received(message_received)
server.run_forever()
