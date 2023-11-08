import 'dart:js_util' as js_util;
import 'package:js/js.dart';

@JS('Response')
@staticInterop
class FetchResponse {}

extension FetchResponseExtension on FetchResponse {
  external int get status;

  @JS('text')
  external Promise _text();

  Future<String> text() => js_util.promiseToFuture(_text());
}

@JS()
@staticInterop
class Promise {}
