import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';

void main(List<String> args) {
  final secret = args[0];

  final jwt = JWT({}, subject: "admin");
  print(jwt.sign(SecretKey(secret)));
}