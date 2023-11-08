import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';

// this is replaced from Dockerfile
final hardcodedSecretKey = SecretKey('<PLACEHOLDER>');

String signJWT(String? username) {
  final jwt = JWT({}, subject: username);
  return jwt.sign(hardcodedSecretKey);
}

JWT? verifyJWT(String? token) {
  if (token == null) {
    return null;
  }

  try {
    final jwt = JWT.verify(token, hardcodedSecretKey);
    return jwt;
  } catch (e) {
    return null;
  }
}

class LoginToken {
  String token;

  LoginToken({required this.token});
  LoginToken.fromJson(Map<String, dynamic> json) : token = json['token'];

  Map<String, dynamic> toJson() => {
    'token': token,
  };
}

class Flag {
  String? flag;

  Flag({required this.flag});
  Flag.fromJson(Map<String, dynamic> json) : flag = json['flag'];

  Map<String, dynamic> toJson() => {
    'flag': flag,
  };
}