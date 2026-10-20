import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { classify } from './classify.ts';

describe('classify', () => {
  it('料金キーワードを料金に分類する', () => {
    assert.equal(classify('月額料金を教えて'), '料金');
  });

  it('不具合キーワードを不具合に分類する', () => {
    assert.equal(classify('画面が動かない'), '不具合');
  });

  it('どれにも当てはまらなければその他', () => {
    assert.equal(classify('資料を送ってください'), 'その他');
  });
});
