import 'dart:convert';
import 'dart:html';

import 'package:chal/js.dart';
import 'package:chal/util.dart';

Future<String?> getFlag(String token) async {
  final FetchResponse res = await window.fetch('/api/flag', {
    'headers': {
      'Authorization': 'Bearer $token',
    },
  });
  if (res.status != 200) {
    throw Exception('Nope');
  }
  final flag = Flag.fromJson(jsonDecode(await res.text()));
  return flag.flag;
}

Future<String> login(String username) async {
  final FetchResponse res = await window.fetch('/api/login', {
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json',
    },
    'body': jsonEncode({'username': username}),
  });
  if (res.status != 200) {
    throw Exception('Login failed');
  }
  final loginToken = LoginToken.fromJson(jsonDecode(await res.text()));
  return loginToken.token;
}

final loginForm = querySelector('#login-form') as FormElement;
final flagForm = querySelector('#flag-form') as FormElement;

void main() {
  String? token;

  loginForm.onSubmit.listen((event) async {
    event.preventDefault();
    final username = (loginForm.querySelector('input[name="username"]') as InputElement).value;
    if (username != null && username.isNotEmpty) {
      token = await login(username);
      flagForm.style.display = 'block';
      (flagForm.querySelector('input[name="username"]') as InputElement).value = verifyJWT(token!)?.subject;
    }
  });

  flagForm.onSubmit.listen((event) async {
    event.preventDefault();
    if (token != null) {
      final flag = await getFlag(token!);
      if (flag != null) {
        window.alert('Flag: $flag');
      }
    }
  });
}
