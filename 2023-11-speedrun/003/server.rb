require 'sinatra'

get '/' do
  if params == {}
    'Hello'
  elsif params[:a] != '1'
    status 400
    'Nope'
  elsif params[:b] != ['2']
    status 401
    'Nope'
  elsif params[:c] != [{'d' => '3', 'e' => nil}]
    status 402
    'Nope'
  elsif request.query_string.include? '&'
    # what was parse_nested_query?
    status 403
    'Nope'
  else
    ENV['FLAG']
  end
end
